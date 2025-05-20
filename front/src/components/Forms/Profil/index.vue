<script setup lang="ts">
    import { onMounted, reactive } from 'vue'

    interface User {
        name: string
        email: string
        password: string
    }

    const user = reactive<User>({
        name: '',
        email: '',
        password: '',
    })

    const fetchUser = async () => {
        try {
            // const response = await fetch('')
            // const { data } = await response.json()
            // user.value = data
        } catch (err) {
            console.error('Error fetching user:', err)
        }
    }

    const submitForm = () => {
        console.log('Submitted:', user)
    }

    onMounted(() => {
        fetchUser()
    })
</script>

<template>
  <main>
    <form class="flex flex-col max-w-sm w-full p-6 bg-white rounded-2xl shadow-md" @submit.prevent="submitForm">
      <label for="name" class="mb-1 text-sm font-medium text-gray-700">Name</label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="name"
        v-model="user.name"
        class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label for="email" class="mb-1 text-sm font-medium text-gray-700">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="email"
        v-model="user.email"
        class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label for="password" class="mb-1 text-sm font-medium text-gray-700">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="password"
        v-model="user.password"
        class="mb-6 px-3 py-2 border border-gray-300 rou=nded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        class="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Submit
      </button>
    </form>
  </main>
</template>
