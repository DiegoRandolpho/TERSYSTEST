import { supabase } from "./utils/supabase.js";
import { LucideIcon } from "./utils/icons.js";
import { Toast } from "./components/Toast.js";
import { LoginPage } from "./components/LoginPage.js";
import { BranchManagement } from "./components/BranchManagement.js";
import { Dashboard } from "./components/Dashboard.js";
import { EquipmentManagement } from "./components/EquipmentManagement.js";
import { UserManagement } from "./components/UserManagement.js";
import { OutsourcingDistribution } from "./components/OutsourcingDistribution.js";
import { BranchTransfer } from "./components/BranchTransfer.js";
import { ConfirmationModal } from "./components/ConfirmationModal.js";

function App() {
    const [currentPage, setCurrentPage] = React.useState('login');
    const [userRole, setUserRole] = React.useState(null);
    const [userId, setUserId] = React.useState(null);
    const [toastMessage, setToastMessage] = React.useState(null);
    const [toastType, setToastType] = React.useState(null);

    const showToast = (message, type) => {
        setToastMessage(message);
        setToastType(type);
    };

    const clearToast = () => {
        setToastMessage(null);
    };

    const handleLoginSuccess = (role, id) => {
        setUserRole(role);
        setUserId(id);
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        setUserRole(null);
        setUserId(null);
        localStorage.clear();
        setCurrentPage('login');
        showToast("Você foi desconectado.", "success");
    };

    React.useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        const storedId = localStorage.getItem('userId');
        if (storedRole && storedId) {
            setUserRole(storedRole);
            setUserId(storedId);
            setCurrentPage('dashboard');
        } else {
            setCurrentPage('login');
        }
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['administrador', 'supervisor', 'motorista'] },
        { id: 'branchManagement', label: 'Cadastro de Filial', icon: 'Building', roles: ['administrador'] },
        { id: 'equipmentManagement', label: 'Cadastro de Equipamento', icon: 'Truck', roles: ['administrador'] },
        { id: 'userManagement', label: 'Cadastro de Usuário', icon: 'User', roles: ['administrador'] },
        { id: 'outsourcingDistribution', label: 'Distribuir Terceirizado', icon: 'ArrowLeftRight', roles: ['administrador', 'supervisor'] },
        { id: 'branchTransfer', label: 'Transferência entre Filiais', icon: 'ArrowLeftRight', roles: ['administrador'] },
    ];

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    if (currentPage === 'login' || !userId) {
        return React.createElement(LoginPage, { onLogin: handleLoginSuccess, showToast: showToast });
    }

    return (
        React.createElement('div', { className: "flex min-h-screen bg-gray-100" },
            // Sidebar
            React.createElement('div', { className: `fixed z-40 inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out bg-gray-900 text-white w-64 p-4 flex flex-col space-y-4` },
                // Header e logo do Sidebar
                React.createElement('div', { className: "flex items-center justify-between lg:justify-center p-2 mb-4" },
                    React.createElement('div', { className: "flex items-center" },
                        React.createElement('img', {
                            src: "https://gfivmnnysomfwrffybeh.supabase.co/storage/v1/object/public/logo//LOGO_TERSYS-removebg-preview%20(1).png",
                            alt: "Logo",
                            className: "h-16 mr-3"
                        }),
                        React.createElement('h1', { className: "text-2xl font-bold" }, "TERSYS")
                    ),
                    React.createElement('button', { onClick: toggleSidebar, className: "text-white lg:hidden" },
                        React.createElement(LucideIcon, { name: "X", className: "h-6 w-6" })
                    )
                ),
                // Itens de navegação
                React.createElement('nav', { className: "flex-1" },
                    React.createElement('ul', null,
                        navItems.map(item => {
                            if (item.roles.includes(userRole)) {
                                const isActive = currentPage === item.id;
                                return (
                                    React.createElement('li', { key: item.id },
                                        React.createElement('a', {
                                            href: "#",
                                            onClick: () => {
                                                setCurrentPage(item.id);
                                                setIsSidebarOpen(false); // Fecha a sidebar em mobile
                                            },
                                            className: `flex items-center p-3 rounded-lg text-lg transition duration-200 ease-in-out ${isActive ? 'bg-blue-600 font-semibold' : 'hover:bg-gray-700'}`
                                        },
                                            React.createElement(LucideIcon, { name: item.icon, className: "mr-3 h-6 w-6" }),
                                            item.label
                                        )
                                    )
                                );
                            }
                            return null;
                        })
                    )
                ),
                // Botão de Logout
                React.createElement('div', { className: "mt-auto" },
                    React.createElement('button', {
                        onClick: handleLogout,
                        className: "flex items-center w-full p-3 rounded-lg text-lg text-red-400 hover:bg-gray-700 transition duration-200 ease-in-out"
                    },
                        React.createElement(LucideIcon, { name: "LogOut", className: "mr-3 h-6 w-6" }),
                        "Sair"
                    )
                )
            ),
            // Main Content
            React.createElement('div', { className: "flex-1 flex flex-col" },
                // Topbar
                React.createElement('header', { className: "bg-white shadow p-4 flex items-center justify-between lg:justify-start" },
                    React.createElement('button', { onClick: toggleSidebar, className: "text-gray-600 lg:hidden" },
                        React.createElement(LucideIcon, { name: "Menu", className: "h-6 w-6" })
                    ),
                    React.createElement('h1', { className: "text-xl font-semibold text-gray-800 ml-4 hidden lg:block" }, "Bem-vindo, " + userId + "!"),
                    React.createElement('div', { className: "ml-auto" },
                        React.createElement('p', { className: "text-sm text-gray-500" }, "Role: " + userRole)
                    )
                ),
                // Main Area
                React.createElement('main', { className: "flex-1 p-6 overflow-y-auto" },
                    React.createElement('div', { className: "container mx-auto" },
                        // Renderiza o componente da página atual
                        currentPage === 'dashboard' && React.createElement(Dashboard, { userId: userId, showToast: showToast }),
                        currentPage === 'branchManagement' && userRole === 'administrador' && React.createElement(BranchManagement, { userId: userId, userRole: userRole, showToast: showToast }),
                        currentPage === 'equipmentManagement' && userRole === 'administrador' && React.createElement(EquipmentManagement, { userId: userId, showToast: showToast }),
                        currentPage === 'userManagement' && userRole === 'administrador' && React.createElement(UserManagement, { userId: userId, showToast: showToast }),
                        currentPage === 'outsourcingDistribution' && React.createElement(OutsourcingDistribution, { userId: userId, showToast: showToast, setCurrentPage: setCurrentPage }),
                        currentPage === 'branchTransfer' && React.createElement(BranchTransfer, { userId: userId, setCurrentPage: setCurrentPage, showToast: showToast }),
                        toastMessage && React.createElement(Toast, { message: toastMessage, type: toastType, onClose: clearToast })
                    )
                )
            )
        )
    );
}

// Este código agora está fora do window.onload
const initializeAndRender = () => {
    // Tenta renderizar
    try {
        ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
    } catch (e) {
        console.error("Erro ao inicializar o cliente Supabase:", e);
    }
}
initializeAndRender();
