document.addEventListener('DOMContentLoaded', () => {
    const cartItems = [
        {name: "Nik PT aniom", quantity: 2},
        {name: "Adidas X Speedportal TF", quantity: 3},
        {name: "Nike Tiempo X Legend", quantity: 4},
        {name: "Nike Air Zoom", quantity: 5},
        {name: "Nike Tiempo X PRO FG", quantity: 6},
        {name: "Nike Phantom GX FG", quantity: 2},
        {name: "Nike Mercurial Superfly 9", quantity: 9},
        {name: "Puma Future 1.3", quantity: 4},
    ];

    const ctx = document.getElementById('popularChart').getContext('2d');
    const labels = cartItems.map(item => item.name);
    const data = {
        labels: labels,
        datasets: [{
            label: 'Популярність товару',
            data: cartItems.map(item => item.quantity),
            backgroundColor: [
                'rgba(0, 128, 0, 1)',  
                'rgba(0, 0, 0, 1)',     
                'rgba(255, 255, 255, 1)',
                'rgb(124, 59, 59)', 
                'rgba(255, 0, 0, 1)',
                'rgb(72, 21, 167)',
                'rgb(27, 148, 218)', 
                'rgb(236, 67, 0)'  
            ],
            borderColor: [
                'rgba(0, 0, 0, 1)',       
                'rgba(0, 0, 0, 1)',       
                'rgba(0, 0, 0, 1)',      
                'rgba(0, 0, 0, 1)',       
                'rgba(0, 0, 0, 1)'        
            ],
            borderWidth: 1
            }]            
    };

    const popularityChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
