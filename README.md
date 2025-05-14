# 📊 Daily Finance Control

Aplicación web moderna para gestionar tus finanzas personales con estilo futurista. Registra ingresos/gastos, visualiza balances y exporta datos a Excel.

## ✨ Características principales
- 🔐 Autenticación segura con Supabase
- 💸 Registro de transacciones con categorías (ingreso/gasto)
- 📅 Visualización mensual y anual de balances
- 📊 Tabla interactiva con filtros por mes
- 🗑️ Eliminación de registros individuales
- 📤 Exportación a Excel con hojas mensuales
- 🎨 Diseño responsive con efectos neón
- 📱 Optimizado para móviles

## 🛠️ Tecnologías utilizadas
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Supabase (Auth + PostgreSQL)
- **Librerías**: 
  - `@supabase/supabase-js@2` - Gestión de base de datos
  - `xlsx@0.18.5` - Exportación a Excel

## 🚀 Configuración inicial
1. **Crear proyecto en Supabase**:
   - Crea una nueva base de datos en [supabase.com](https://supabase.com)
   - Crea una tabla `Finanzas` con este esquema:
     ```sql
     CREATE TABLE Finanzas (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID REFERENCES auth.users NOT NULL,
       type VARCHAR(7) CHECK (type IN ('ingreso', 'gasto')),
       amount NUMERIC(10,2) NOT NULL,
       description TEXT,
       date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```

2. **Configurar variables**:
   - Reemplazar en `app.js`:
     ```javascript
     const client = supabase.createClient(
       'TU_SUPABASE_URL',
       'TU_SUPABASE_KEY'
     );
     ```

3. **Ejecutar**:
   - Abrir `index.html` en navegador moderno

## 🖥️ Uso básico
1. **Registro/Inicio de sesión**
   - Usa el mismo formulario para registrarte o iniciar sesión
   - Confirmación de email requerida para primer acceso

2. **Agregar transacción**
   - Selecciona tipo (ingreso/gasto)
   - Ingresa monto y descripción
   - Click en "Agregar"

3. **Filtrar por mes**
   - Usa el selector desplegable superior
   - Visualización automática de transacciones

4. **Exportar datos**
   - Click en "Exportar a Excel" genera reporte anual
   - Archivo organizado por meses en hojas separadas

## 📱 Compatibilidad
- Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+)
- Dispositivos móviles (iOS/Android)
- Modo oscuro preferente

