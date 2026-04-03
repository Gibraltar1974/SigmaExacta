// ui.js

// Cargar el header dinámicamente
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;
    // Inicializar la navegación después de cargar el header
    initNavigation();
  })
  .catch(error => console.error('Error loading header:', error));

function initNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const toolsDropdownToggle = document.getElementById('tools-dropdown-toggle');
  const toolsDropdownMenu = document.getElementById('tools-dropdown-menu');
  const toolsDropdownContainer = document.getElementById('tools-dropdown-container');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show-menu');
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }

      if (!navMenu.classList.contains('show-menu')) {
        if (toolsDropdownMenu) toolsDropdownMenu.classList.remove('show-submenu');
        if (toolsDropdownContainer) toolsDropdownContainer.classList.remove('active');
      }
    });
  }

  if (toolsDropdownToggle) {
    toolsDropdownToggle.addEventListener('click', (event) => {
      if (window.innerWidth <= 992) {
        event.preventDefault();
        if (toolsDropdownMenu) toolsDropdownMenu.classList.toggle('show-submenu');
        if (toolsDropdownContainer) toolsDropdownContainer.classList.toggle('active');
      }
    });
  }
}

// Función para cambiar entre pestañas
function switchTab(tabId) {
  // Quitar clase active de todos los botones y contenidos
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // Activar el contenido seleccionado
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');

  // Activar botón correspondiente
  const activeBtn = document.querySelector(`button[onclick="switchTab('${tabId}')"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Si la pestaña activa es "Visualize", ajustar el gráfico
  // Nota: validamos que la variable global 'network' exista (definida en fmea-logic.js)
  if (tabId === 'tab-visualize' && typeof network !== 'undefined' && network) {
    setTimeout(() => {
      network.fit({ animation: false });
    }, 100);
  }
}