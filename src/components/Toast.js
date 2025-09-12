export function Toast({ message, type, onClose }) {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? '✔' : '✖';

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        React.createElement('div', { className: `fixed bottom-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 transition-all duration-300 ease-in-out transform translate-y-0 opacity-100` },
            React.createElement('span', { className: "font-bold text-xl" }, icon),
            React.createElement('p', null, message),
            React.createElement('button', { onClick: onClose, className: "ml-4 font-bold opacity-75 hover:opacity-100 transition-opacity" }, 'X')
        )
    );
}
