import React from 'react';

export function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    React.createElement('div', {
        className: "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      },
      React.createElement('div', {
          className: "bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto"
        },
        React.createElement('div', { className: "text-center" },
          React.createElement('h3', { className: "text-lg leading-6 font-medium text-gray-900" }, "Confirmação"),
          React.createElement('div', { className: "mt-2" },
            React.createElement('p', { className: "text-sm text-gray-500" }, message)
          ),
          React.createElement('div', { className: "mt-4 flex justify-around" },
            React.createElement('button', {
              type: "button",
              className: "inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:text-sm",
              onClick: onConfirm
            }, "Confirmar"),
            React.createElement('button', {
              type: "button",
              className: "inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm",
              onClick: onCancel
            }, "Cancelar")
          )
        )
      )
    )
  );
}
