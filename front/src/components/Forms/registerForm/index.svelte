<script>
	let data = { name: '', email: '', password: '', confirmPassword: '' };

	async function submittedData() {
		console.log('Données soumises :', data);

		try {
			const response = await fetch('http://localhost:1337/api/auth/local/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: data.name,
					email: data.email,
					password: data.password,
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				console.log("Erreur :", result);
				alert('Erreur : ' + (result?.error?.message || 'Inconnue'));
			} else {
				console.log('Inscription réussie :', result);
				alert('Inscription réussie !');
			}

		} catch (err) {
			console.error('KO :', err);
			alert('Erreur réseau');
		}
	}
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
    <form class="flex flex-col max-w-sm w-full p-6 bg-white rounded-2xl shadow-md" on:submit|preventDefault={submittedData}>
        
        <h1 class="text-2xl font-bold mb-4 text-center">Inscription</h1>
    
        <label for="name" class="mb-1 text-sm font-medium text-gray-700">Nom</label>
        <input
            id="name"
            name="name"
            type="text"
            placeholder="Votre nom"
            bind:value={data.name}
            class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
        />
        
        <label for="email" class="mb-1 text-sm font-medium text-gray-700">Email</label>
        <input
            id="email"
            name="email"
            type="email"
            placeholder="votre@email.com"
            bind:value={data.email}
            class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
        />
        
        <label for="password" class="mb-1 text-sm font-medium text-gray-700">Mot de passe</label>
        <input
            id="password"
            name="password"
            type="password"
            placeholder="Mot de passe"
            bind:value={data.password}
            class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
        />
        
        <label for="confirmPassword" class="mb-1 text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
        <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirmer le mot de passe"
            bind:value={data.confirmPassword}
            class="mb-6 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
        />
    
        <button
            type="submit"
            class="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            S'inscrire
        </button>
    </form>
</div> 