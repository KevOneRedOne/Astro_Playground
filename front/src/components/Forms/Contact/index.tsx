import { createSignal } from "solid-js";

const ContactForm = () => {
    const [name, setName] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [message, setMessage] = createSignal("");
    const [submitted, setSubmitted] = createSignal(false);
    const [error, setError] = createSignal(false);
    const [loading, setLoading] = createSignal(false);

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        setSubmitted(false);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name(),
                    email: email(),
                    message: message(),
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            setSubmitted(true);
            setName("");
            setEmail("");
            setMessage("");
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} class="flex flex-col max-w-sm w-full p-6 bg-white rounded-2xl shadow-md">
            <h1 class="text-2xl font-bold mb-4 text-center">Contact</h1>
            <label for="name" class="mb-1 text-sm font-medium text-gray-700">Name</label>
            <input 
                type="text"
                value={name()}
                onInput={e => setName(e.currentTarget.value)}
                class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <label for="email" class="mb-1 text-sm font-medium text-gray-700">Email</label>
            <input 
                type="email"
                value={email()}
                onInput={e => setEmail(e.currentTarget.value)}
                class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <label for="message" class="mb-1 text-sm font-medium text-gray-700">Message</label>
            <textarea
                value={message()}
                onInput={e => setMessage(e.currentTarget.value)}
                class="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <button
                type="submit"
                class="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                disabled={loading()}
            >
                Envoyer
            </button>
            {loading() && (
                <div class="text-blue-800 font-bold mt-2">Chargement...</div>
            )}
            {error() && (
                <div class="text-red-800 font-bold mt-2">Une erreur est survenue</div>
            )}
            {submitted() && (
                <div class="text-green-800 font-bold mt-2">Merci pour votre message !</div>
            )}
        </form>
    );
}

export default ContactForm;