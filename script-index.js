// script-index.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Cargar el header dinámicamente ---
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;

            // Lógica de navegación después de cargar el header
            const navToggle = document.getElementById('nav-toggle');
            const navMenu = document.getElementById('nav-menu');
            const toolsDropdownToggle = document.getElementById('tools-dropdown-toggle');
            const toolsDropdownMenu = document.getElementById('tools-dropdown-menu');
            const toolsDropdownContainer = document.getElementById('tools-dropdown-container');

            if (navToggle && navMenu) {
                navToggle.addEventListener('click', () => {
                    navMenu.classList.toggle('show-menu');
                    const icon = navToggle.querySelector('i');
                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                    if (!navMenu.classList.contains('show-menu')) {
                        if (toolsDropdownMenu) toolsDropdownMenu.classList.remove('show-submenu');
                        if (toolsDropdownContainer) toolsDropdownContainer.classList.remove('active');
                    }
                });
            }

            if (toolsDropdownToggle && toolsDropdownMenu && toolsDropdownContainer) {
                toolsDropdownToggle.addEventListener('click', (event) => {
                    if (window.innerWidth <= 992) {
                        event.preventDefault();
                        toolsDropdownMenu.classList.toggle('show-submenu');
                        toolsDropdownContainer.classList.toggle('active');
                    }
                });
            }

        })
        .catch(error => {
            console.error('Error al cargar el header:', error);
            document.getElementById('header-placeholder').innerHTML = '<p style="text-align: center; color: red;">Error al cargar el menú de navegación.</p>';
        });
});