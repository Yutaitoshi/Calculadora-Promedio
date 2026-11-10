# 📊 Calculadora de Calificaciones - Universidad de Córdoba

Sistema web para la gestión de notas académicas, cálculo automático de promedios definitivos y predicción de notas necesarias por corte.

---

## 🚀 Características
- **Configuración personalizada de porcentajes**: Ajusta los pesos de Corte 1, Corte 2 y Corte 3 (deben sumar 100%).
- **Cálculo automático de notas**: Estado en tiempo real (Aprobado, Reprobado, En Progreso, Inalcanzable).
- **Predicción de notas**: Calcula la nota mínima requerida en el Corte 3 para aprobar (3.0) o alcanzar la nota máxima (5.0).
- **Importación y Exportación en CSV**: Respalda y carga listados completos de estudiantes en formato CSV delimitado por comas o punto y coma.
- **Persistencia local**: Guarda tus datos en `localStorage` para que no se pierdan al cerrar el navegador.
- **Atajos de teclado**:
  - `Ctrl + M`: Registrar nuevo estudiante / limpiar formulario.
  - `Ctrl + S`: Guardar o actualizar estudiante.
  - `Ctrl + E`: Exportar a CSV.
  - `Esc`: Cancelar edición.

---

## 🛠️ Tecnologías Utilizadas
- **HTML5**: Estructura semántica con componente colapsable de ayuda.
- **CSS3**: Diseño responsivo y paleta institucional de la Universidad de Córdoba.
- **JavaScript (Vanilla)**: Lógica de cálculo, validación y persistencia local sin librerías externas.

---

## 📁 Estructura del Proyecto
```text
Mi Proyecto Nombre Apellido/
├── index.html     # Interfaz principal de la aplicación
├── styles.css     # Estilos y diseño visual
├── script.js      # Lógica de cálculos, tabla y eventos
└── README.md      # Documentación del proyecto
```

