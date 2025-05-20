<template>
    <section class="py-10 bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-4xl font-bold mb-4">Find Your Perfect Car</h1>
            <p class="text-xl mb-6">Browse our selection of quality vehicles</p>
            <div class="max-w-md mx-auto">
                <div class="flex bg-white rounded-lg overflow-hidden">
                    <input
                        type="text"
                        placeholder="Search by make, model, or keyword..." 
                        class="flex-grow px-4 py-2 text-gray-800 focus:outline-none"
                    />
                    <button class="bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors">
                        Search
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>

</script>