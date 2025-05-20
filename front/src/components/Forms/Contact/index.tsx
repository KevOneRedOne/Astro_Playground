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
        <form onSubmit={handleSubmit} class="flex flex-col gap-4 bg-white shadow-lg p-8 rounded max-w-md mx-auto">
            <label>
                Nom :
                <input 
                    type="text"
                    value={name()}
                    onInput={e => setName(e.currentTarget.value)}
                    class="border p-2 rounded w-full"
                    required
                />
            </label>
            <label>
                Email :
                <input 
                    type="email"
                    value={email()}
                    onInput={e => setEmail(e.currentTarget.value)}
                    class="border p-2 rounded w-full"
                    required
                />
            </label>
            <label>
                Message :
                <textarea
                    value={message()}
                    onInput={e => setMessage(e.currentTarget.value)}
                    class="border p-2 rounded w-full h-32 resize-none"
                    required
                />
            </label>
            <button
                type="submit"
                class="bg-purple-600 hover:bg-purple-800 text-white rounded py-2 px-4 font-bold"
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