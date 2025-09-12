import { supabase } from '../utils/supabase.js';
import { LucideIcon } from '../utils/icons.js';

export function Dashboard({ userId, showToast }) {
    const [data, setData] = React.useState({
        equipmentCount: 0,
        branchCount: 0,
        userCount: 0,
        userBranch: null
    });
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Busca a contagem de equipamentos
                const { count: equipmentCount, error: equipmentError } = await supabase
                    .from('equipment')
                    .select('*', { count: 'exact', head: true });
                if (equipmentError) throw equipmentError;

                // Busca a contagem de filiais
                const { count: branchCount, error: branchError } = await supabase
                    .from('filiais')
                    .select('*', { count: 'exact', head: true });
                if (branchError) throw branchError;

                // Busca a contagem de usuários
                const { count: userCount, error: userError } = await supabase
                    .from('app_users')
                    .select('*', { count: 'exact', head: true });
                if (userError) throw userError;

                // Busca a filial do usuário logado
                const { data: userData, error: userFetchError } = await supabase
                    .from('app_users')
                    .select('branch_id')
                    .eq('username', userId)
                    .single();
                if (userFetchError) throw userFetchError;

                // Busca o nome da filial
                let userBranchName = 'Não atribuído';
                if (userData && userData.branch_id) {
                    const { data: branchData, error: branchNameError } = await supabase
                        .from('filiais')
                        .select('name')
                        .eq('id', userData.branch_id)
                        .single();
                    if (branchNameError) throw branchNameError;
                    if (branchData) {
                        userBranchName = branchData.name;
                    }
                }

                setData({
                    equipmentCount,
                    branchCount,
                    userCount,
                    userBranch: userBranchName
                });

            } catch (err) {
                console.error("Erro ao buscar dados do dashboard:", err.message);
                setError("Erro ao carregar dados do dashboard.");
                showToast("Erro ao carregar dados.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId, showToast]);

    if (isLoading) {
        return (
            React.createElement('div', { className: "flex justify-center items-center h-full" },
                React.createElement('svg', { className: "animate-spin h-10 w-10 text-blue-500", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                    React.createElement('circle', { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    React.createElement('path', { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ),
                React.createElement('span', { className: "ml-4 text-gray-600" }, "Carregando dados...")
            )
        );
    }

    if (error) {
        return (
            React.createElement('div', { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" },
                React.createElement('p', { className: "text-center" }, error)
            )
        );
    }

    return (
        React.createElement('div', { className: "bg-white p-6 rounded-xl shadow-lg" },
            React.createElement('div', { className: "text-center mb-6" },
                React.createElement('h2', { className: "text-3xl font-bold text-gray-800" }, "Bem-vindo, " + userId.charAt(0).toUpperCase() + userId.slice(1) + "!"),
                React.createElement('p', { className: "text-gray-500" }, "Filial: " + (data.userBranch || 'N/A'))
            ),
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                // Card de Equipamentos
                React.createElement('div', { className: "bg-blue-500 text-white p-6 rounded-lg shadow-md flex items-center justify-between" },
                    React.createElement('div', null,
                        React.createElement('div', { className: "text-2xl font-bold" }, data.equipmentCount),
                        React.createElement('div', { className: "text-sm font-medium opacity-80" }, "Equipamentos")
                    ),
                    React.createElement(LucideIcon, { name: "Truck", className: "w-10 h-10 opacity-75" })
                ),
                // Card de Filiais
                React.createElement('div', { className: "bg-green-500 text-white p-6 rounded-lg shadow-md flex items-center justify-between" },
                    React.createElement('div', null,
                        React.createElement('div', { className: "text-2xl font-bold" }, data.branchCount),
                        React.createElement('div', { className: "text-sm font-medium opacity-80" }, "Filiais")
                    ),
                    React.createElement(LucideIcon, { name: "Building", className: "w-10 h-10 opacity-75" })
                ),
                // Card de Usuários
                React.createElement('div', { className: "bg-purple-500 text-white p-6 rounded-lg shadow-md flex items-center justify-between" },
                    React.createElement('div', null,
                        React.createElement('div', { className: "text-2xl font-bold" }, data.userCount),
                        React.createElement('div', { className: "text-sm font-medium opacity-80" }, "Usuários")
                    ),
                    React.createElement(LucideIcon, { name: "User", className: "w-10 h-10 opacity-75" })
                )
            )
        )
    );
}
