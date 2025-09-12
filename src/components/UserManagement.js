import { supabase } from '../utils/supabase.js';
import { LucideIcon } from '../utils/icons.js';

export function UserManagement({ userId, showToast }) {
    const [users, setUsers] = React.useState([]);
    const [branches, setBranches] = React.useState([]);
    const [newUser, setNewUser] = React.useState({
        username: '',
        password: '',
        role: 'motorista',
        branch_id: ''
    });
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [editingUser, setEditingUser] = React.useState(null);

    React.useEffect(() => {
        const fetchUsersAndBranches = async () => {
            setIsLoading(true);
            try {
                const { data: usersData, error: usersError } = await supabase.from('app_users').select('*').order('username', { ascending: true });
                if (usersError) throw usersError;
                setUsers(usersData);

                const { data: branchesData, error: branchesError } = await supabase.from('filiais').select('id, name');
                if (branchesError) throw branchesError;
                setBranches(branchesData);

            } catch (e) {
                console.error("Erro ao carregar dados:", e);
                setError("Erro ao carregar dados.");
                showToast("Erro ao carregar dados.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsersAndBranches();
    }, [showToast]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const { error: insertError } = await supabase
                .from('app_users')
                .insert([{
                    ...newUser,
                    created_by: userId
                }]);
            if (insertError) throw insertError;
            showToast("Usuário adicionado com sucesso!", "success");
            setNewUser({ username: '', password: '', role: 'motorista', branch_id: '' });
            const { data: updatedUsers } = await supabase.from('app_users').select('*').order('username', { ascending: true });
            setUsers(updatedUsers);
        } catch (e) {
            console.error("Erro ao adicionar usuário:", e);
            setError("Erro ao adicionar usuário.");
            showToast("Erro ao adicionar usuário.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    // ... (lógica de edição e exclusão)

    return (
        React.createElement('div', { className: "bg-white p-6 rounded-xl shadow-lg" },
            React.createElement('h2', { className: "text-2xl font-bold text-gray-800 mb-4 text-center" }, "Cadastro de Usuários"),
            // ... (formulário de adição)
            // ... (tabela de usuários)
        )
    );
}
