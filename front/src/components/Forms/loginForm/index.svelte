<script>
	let data = { name: '', email: '', password: '' };

	function submittedData() {
		console.log('Données soumises :', data);
	}
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
    <form class="flex flex-col max-w-sm w-full p-6 bg-white rounded-2xl shadow-md" on:submit|preventDefault={submittedData}>

        <h1 class="text-2xl font-bold mb-4 text-center">Login</h1>

        <label for="name" class="mb-1 text-sm font-medium text-gray-700">Name</label>
        <input
            id="name"
            name="name"
            type="text"
            placeholder="name"
            bind:value={data.name}
            class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label for="email" class="mb-1 text-sm font-medium text-gray-700">Email</label>
        <input
            id="email"
            name="email"
            type="email"
            placeholder="email"
            bind:value={data.email}
            class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label for="password" class="mb-1 text-sm font-medium text-gray-700">Password</label>
        <input
            id="password"
            name="password"
            type="password"
            placeholder="password"
            bind:value={data.password}
            class="mb-6 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
            type="submit"
            class="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Submit
        </button>
    </form>
</div>

