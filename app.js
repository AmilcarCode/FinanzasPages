// Configuración de Supabase
const client = supabase.createClient(
    'https://tbbpggnvbqasrlcxqquz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYnBnZ252YnFhc3JsY3hxcXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNjkzMDUsImV4cCI6MjA2Mjc0NTMwNX0.npDqEwBEnxfFxo5dOU4hfm4diRG3-TaaqPucpmsY3FM'
);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Configurar fecha actual
        const now = new Date();
        document.getElementById('currentDate').textContent = 
            `${now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;

        // Asegurar que el formulario existe
        const form = document.getElementById('transactionForm');
        if (!form) throw new Error('El formulario no existe en el DOM');

        // Event listeners
        form.addEventListener('submit', handleSubmit);
        
        document.getElementById('exportExcel').addEventListener('click', exportToExcel);
        
        // Inicializar
        await initApp();
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
});

async function initApp() {
    await loadTransactions();
    await updateBalances();
    populateMonthSelector();
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const transaction = {
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value,
        date: new Date().toISOString()
    };

    const { error } = await client
        .from('Finanzas')
        .insert([transaction]);

    if (!error) {
        await loadTransactions();
        await updateBalances();
        document.getElementById('transactionForm').reset();
    }
}

async function loadTransactions() {
    const { data, error } = await client
        .from('Finanzas')
        .select('*')
        .order('date', { ascending: false });

    if (!error) {
        renderTransactions(data);
        setupMonthFilter(data);
    }
}

function renderTransactions(transactions) {
    const tbody = document.querySelector('#FinanzasTable tbody');
    tbody.innerHTML = '';

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString('es-ES')}</td>
            <td>${transaction.type.toUpperCase()}</td>
            <td class="${transaction.type === 'gasto' ? 'negative' : 'positive'}">
                $${transaction.amount.toFixed(2)}
            </td>
            <td>${transaction.description}</td>
            <td>
                <button onclick="eliminarRegistro('${transaction.id}')">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function updateBalances() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const paddedMonth = String(currentMonth).padStart(2, '0');
    const lastDay = new Date(currentYear, currentMonth, 0).getDate(); // último día del mes

    // Balance mensual
    const { data: monthlyData = [], error: monthError } = await client
        .from('Finanzas')
        .select('amount, type')
        .gte('date', `${currentYear}-${paddedMonth}-01`)
        .lte('date', `${currentYear}-${paddedMonth}-${lastDay}`);

    if (monthError) console.error('Error al cargar datos mensuales:', monthError);

    const monthlyBalance = monthlyData.reduce((acc, curr) => {
        return curr.type === 'ingreso' ? acc + curr.amount : acc - curr.amount;
    }, 0);

    document.getElementById('currentBalance').textContent = monthlyBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Balance anual
    const { data: annualData = [], error: yearError } = await client
        .from('Finanzas')
        .select('amount, type')
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`);

    if (yearError) console.error('Error al cargar datos anuales:', yearError);

    const annualBalance = annualData.reduce((acc, curr) => {
        return curr.type === 'ingreso' ? acc + curr.amount : acc - curr.amount;
    }, 0);

    document.getElementById('annualBalance').textContent = annualBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


function populateMonthSelector() {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const selector = document.getElementById('monthSelector');
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        option.selected = index === new Date().getMonth();
        selector.appendChild(option);
    });
}

async function exportToExcel() {
    const { data } = await client
        .from('Finanzas')
        .select('*');

    const workbook = XLSX.utils.book_new();
    const currentYear = new Date().getFullYear();

    // Crear una hoja por mes
    for (let month = 0; month < 12; month++) {
        const monthlyData = data.filter(t => 
            new Date(t.date).getMonth() === month && 
            new Date(t.date).getFullYear() === currentYear
        );
        
        if (monthlyData.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(monthlyData);
            XLSX.utils.book_append_sheet(
                workbook, 
                worksheet, 
                `${String(month + 1).padStart(2, '0')}-${currentYear}`
            );
        }
    }

    XLSX.writeFile(workbook, `Finanzas_${currentYear}.xlsx`);
}

function setupMonthFilter(data) {
    const selector = document.getElementById('monthSelector');
    selector.addEventListener('change', () => {
        const selectedMonth = parseInt(selector.value) - 1;
        const currentYear = new Date().getFullYear();
        const filtered = data.filter(t => 
            new Date(t.date).getMonth() === selectedMonth &&
            new Date(t.date).getFullYear() === currentYear
        );
        renderTransactions(filtered);
    });
}

async function initApp() {
    console.log('Iniciando app...'); // ✔️ Verifica si llega aquí
    await loadTransactions();
    await updateBalances();
    populateMonthSelector();
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
async function eliminarRegistro(id) {
    const { error } = await client
        .from('Finanzas') // Reemplaza con el nombre real
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error al eliminar: ' + error.message);
    } else {
        alert('Registro eliminado correctamente');
        loadTransactions(); // Recarga la tabla
    }
}