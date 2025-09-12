import { supabase } from '../utils/supabase.js';
import { ConfirmationModal } from './ConfirmationModal.js';
import { LucideIcon } from '../utils/icons.js';

export function BranchManagement({ userId, userRole, showToast }) {
    const [newBranchName, setNewBranchName] = React.useState('');
    const [branches, setBranches] = React.useState([]);
    const [responsibleInput, setResponsibleInput] = React.useState("");
    const [error, setError] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showConfirmModal, setShowConfirmModal] = React.useState(false);
    const [branchToDelete, setBranchToDelete] = React.useState(null);
    const [editingBranch, setEditingBranch] = React.useState(null);
    const [originalBranch, setOriginalBranch] = React.useState(null);
    const [availableSupervisors, setAvailableSupervisors] = React.useState([]);

    React.useEffect(() => {
        if (!userId || !userRole) return;
        const fetchBranchesAndSupervisors = async () => {
            setIsLoading(true);

            // Fetch filiais
            const query = supabase.from('filiais').select('*').order('created_at', { ascending: false });
            if (userRole === 'supervisor') {
                query.eq('responsible', userId);
            }
            const { data: branchesData, error: fetchBranchesError } = await query;

            if (fetchBranchesError) {
                console.error("Erro ao buscar filiais:", fetchBranchesError);
                setError("Erro ao carregar filiais.");
                showToast("Erro ao carregar filiais.", "error");
            } else {
                setBranches(branchesData);
            }

            // Fetch supervisors
            const { data: supervisorsData, error: fetchSupervisorsError } = await supabase
                .from('app_users')
                .select('username')
                .eq('role', 'supervisor')
                .order('username', { ascending: true });
            if (fetchSupervisorsError) {
                console.error("Erro ao buscar supervisores:", fetchSupervisorsError);
                setError("Erro ao carregar supervisores.");
                showToast("Erro ao carregar supervisores.", "error");
            } else {
                setAvailableSupervisors(supervisorsData.map(u => u.username));
            }

            setIsLoading(false);
        };

        fetchBranchesAndSupervisors();
    }, [userId, userRole, showToast]);

    const handleAddBranch = async (e) => {
        e.preventDefault();
        const trimmedBranchName = newBranchName.trim();

        if (!trimmedBranchName) {
            setError("O nome da filial não pode estar vazio.");
            showToast("O nome da filial não pode estar vazio.", "error");
            return;
        }
        if (!responsibleInput.trim()) {
            setError("Por favor, selecione um responsável para a nova filial.");
            showToast("Selecione um responsável.", "error");
            return;
        }

        setIsLoading(true);
        try {
            // Check for duplicate branch name (case-insensitive)
            const { data: existingBranches, error: checkError } = await supabase
                .from('filiais')
                .select('id')
                .ilike('name', trimmedBranchName);

            if (checkError) throw checkError;
            if (existingBranches && existingBranches.length > 0) {
                setError("Já existe uma filial com este nome. Por favor, escolha outro.");
                showToast("Filial já existe.", "error");
                setIsLoading(false);
                return;
            }

            const { error: insertError } = await supabase
                .from('filiais')
                .insert([
                    {
                        name: trimmedBranchName,
                        created_by_username: userId,
                        responsible: responsibleInput.trim(),
                    },
                ]);
            if (insertError) throw insertError;
            setNewBranchName('');
            setResponsibleInput("");
            setError(null);
            showToast("Filial adicionada com sucesso!", "success");
            const query = supabase.from('filiais').select('*').order('created_at', { ascending: false });
            if (userRole === 'supervisor') {
                query.eq('responsible', userId);
            }
            const { data } = await query;
            setBranches(data);
        } catch (e) {
            console.error("Erro ao adicionar filial:", e);
            setError("Erro ao adicionar filial.");
            showToast("Erro ao adicionar filial.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (branch) => {
        setEditingBranch({ ...branch });
        setOriginalBranch({ ...branch });
    };

    const handleCancelEdit = () => {
        setEditingBranch(null);
        setOriginalBranch(null);
        setBranches(prevBranches => prevBranches.map(b => b.id === originalBranch.id ? originalBranch : b));
    };

    const handleUpdateBranch = async () => {
        if (!editingBranch) return;
        const trimmedBranchName = editingBranch.name.trim();

        if (!trimmedBranchName) {
            setError("O nome da filial não pode estar vazio.");
            showToast("O nome da filial não pode estar vazio.", "error");
            return;
        }
        if (!editingBranch.responsible.trim()) {
            setError("Por favor, selecione um responsável para a filial.");
            showToast("Selecione um responsável.", "error");
            return;
        }
        setIsLoading(true);
        try {
            const { data: existingBranches, error: checkError } = await supabase
                .from('filiais')
                .select('id')
                .ilike('name', trimmedBranchName)
                .neq('id', editingBranch.id);

            if (checkError) throw checkError;
            if (existingBranches && existingBranches.length > 0) {
                setError("Já existe outra filial com este nome. Por favor, escolha outro.");
                showToast("Nome de filial duplicado.", "error");
                setIsLoading(false);
                return;
            }
            const { error: updateError } = await supabase
                .from('filiais')
                .update({ name: trimmedBranchName, responsible: editingBranch.responsible.trim() })
                .eq('id', editingBranch.id);
            if (updateError) throw updateError;
            showToast("Filial atualizada com sucesso!", "success");
            setEditingBranch(null);
            setOriginalBranch(null);
            const query = supabase.from('filiais').select('*').order('created_at', { ascending: false });
            if (userRole === 'supervisor') {
                query.eq('responsible', userId);
            }
            const { data } = await query;
            setBranches(data);
        } catch (e) {
            console.error("Erro ao atualizar filial:", e);
            setError("Erro ao atualizar filial.");
            showToast("Erro ao atualizar filial.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFieldChange = (e, fieldName) => {
        setEditingBranch(prev => ({ ...prev, [fieldName]: e.target.value }));
    };

    const confirmDeleteBranch = (branch) => {
        setBranchToDelete(branch);
        setShowConfirmModal(true);
    };

    const handleDeleteBranch = async () => {
        if (!branchToDelete) return;
        setIsLoading(true);
        setShowConfirmModal(false);
        try {
            const { error: deleteError } = await supabase
                .from('filiais')
                .delete()
                .eq('id', branchToDelete.id);
            if (deleteError) throw deleteError;
            showToast("Filial excluída com sucesso!", "success");
            const query = supabase.from('filiais').select('*').order('created_at', { ascending: false });
            if (userRole === 'supervisor') {
                query.eq('responsible', userId);
            }
            const { data } = await query;
            setBranches(data);
        } catch (e) {
            console.error("Erro ao excluir filial:", e);
            setError("Erro ao excluir filial.");
            showToast("Erro ao excluir filial.", "error");
        } finally {
            setIsLoading(false);
            setBranchToDelete(null);
        }
    };

    return (
        React.createElement('div', { className: "bg-white p-6 rounded-xl shadow-lg" },
            React.createElement('h2', { className: "text-2xl font-bold text-gray-800 mb-4 text-center" }, "Cadastro de Filiais"),
            error && (
                React.createElement('div', { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4", role: "alert" },
                    React.createElement('strong', { className: "font-bold" }, "Erro:"),
                    React.createElement('span', { className: "block sm:inline" }, " ", error)
                )
            ),
            React.createElement('form', { onSubmit: handleAddBranch, className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" },
                React.createElement('input', { type: "text", value: newBranchName, onChange: (e) => setNewBranchName(e.target.value), className: "flex-grow mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out", placeholder: "Nome da nova filial", required: true, disabled: isLoading }),
                React.createElement('div', { className: "relative" },
                    React.createElement('select', { value: responsibleInput, onChange: (e) => setResponsibleInput(e.target.value), className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out", disabled: isLoading, required: true },
                        React.createElement('option', { value: "", disabled: true }, "Selecione um supervisor"),
                        availableSupervisors.map(username => (
                            React.createElement('option', { key: username, value: username }, username)
                        ))
                    ),
                    React.createElement('div', { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700" },
                        React.createElement(LucideIcon, { name: "ChevronDown", className: "h-4 w-4" })
                    )
                ),
                React.createElement('button', {
                    type: "submit",
                    className: "w-full sm:col-span-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out transform hover:scale-105",
                    disabled: isLoading
                }, isLoading ? 'Adicionando...' : 'Adicionar Filial')
            ),
            React.createElement('div', { className: "overflow-x-auto" },
                React.createElement('table', { className: "min-w-full divide-y divide-gray-200" },
                    React.createElement('thead', { className: "bg-gray-50" },
                        React.createElement('tr', null,
                            React.createElement('th', { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "ID"),
                            React.createElement('th', { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Nome"),
                            React.createElement('th', { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Responsável"),
                            React.createElement('th', { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Criado por"),
                            React.createElement('th', { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Data de Criação"),
                            React.createElement('th', { scope: "col", className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Ações")
                        )
                    ),
                    React.createElement('tbody', { className: "bg-white divide-y divide-gray-200" },
                        branches.map(branch => (
                            React.createElement('tr', { key: branch.id },
                                React.createElement('td', { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" }, branch.id),
                                React.createElement('td', { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" },
                                    editingBranch && editingBranch.id === branch.id ? (
                                        React.createElement('input', {
                                            type: "text",
                                            value: editingBranch.name,
                                            onChange: (e) => handleFieldChange(e, 'name'),
                                            className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        })
                                    ) : (
                                        branch.name
                                    )
                                ),
                                React.createElement('td', { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" },
                                    editingBranch && editingBranch.id === branch.id ? (
                                        React.createElement('select', {
                                            value: editingBranch.responsible,
                                            onChange: (e) => handleFieldChange(e, 'responsible'),
                                            className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        },
                                            availableSupervisors.map(username => (
                                                React.createElement('option', { key: username, value: username }, username)
                                            ))
                                        )
                                    ) : (
                                        branch.responsible
                                    )
                                ),
                                React.createElement('td', { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" }, branch.created_by_username),
                                React.createElement('td', { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" }, new Date(branch.created_at).toLocaleDateString()),
                                React.createElement('td', { className: "px-6 py-4 whitespace-nowrap text-center text-sm font-medium" },
                                    editingBranch && editingBranch.id === branch.id ? (
                                        React.createElement('div', { className: "flex justify-center space-x-2" },
                                            React.createElement('button', {
                                                onClick: handleUpdateBranch,
                                                className: "text-green-600 hover:text-green-900 transition duration-150 ease-in-out transform hover:scale-110",
                                                title: "Salvar"
                                            }, React.createElement(LucideIcon, { name: "Save", className: "h-5 w-5" })),
                                            React.createElement('button', {
                                                onClick: handleCancelEdit,
                                                className: "text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out transform hover:scale-110",
                                                title: "Cancelar"
                                            }, React.createElement(LucideIcon, { name: "Ban", className: "h-5 w-5" }))
                                        )
                                    ) : (
                                        React.createElement('div', { className: "flex justify-center space-x-2" },
                                            React.createElement('button', {
                                                onClick: () => handleEditClick(branch),
                                                className: "text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out transform hover:scale-110",
                                                title: "Editar"
                                            }, React.createElement(LucideIcon, { name: "Edit", className: "h-5 w-5" })),
                                            React.createElement('button', {
                                                onClick: () => confirmDeleteBranch(branch),
                                                className: "text-red-600 hover:text-red-900 transition duration-150 ease-in-out transform hover:scale-110",
                                                title: "Excluir"
                                            }, React.createElement(LucideIcon, { name: "Trash2", className: "h-5 w-5" }))
                                        )
                                    )
                                )
                            )
                        ))
                    )
                )
            ),
            showConfirmModal && React.createElement(ConfirmationModal, {
                message: "Tem certeza de que deseja excluir esta filial? Esta ação não pode ser desfeita.",
                onConfirm: handleDeleteBranch,
                onCancel: () => setShowConfirmModal(false)
            })
        )
    );
}
