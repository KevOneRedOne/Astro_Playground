import { createSignal } from "solid-js";

interface CardProps {
  id: string;
  documentId: string;
  name: string;
  model: string;
  image?: {
    url: string;
    alt?: string;
  }[];
}

export default function Card(props: CardProps) {
  const { id, name, model, image } = props;

  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div class="relative h-48 w-full overflow-hidden">
        {image && image.length > 0 ? (
          <img
            src={image[0].url || ""}
            alt={`${name} ${model}`}
            class="w-full h-full object-cover"
          />
        ) : (
          <div class="bg-gray-200 w-full h-full flex items-center justify-center">
            <span class="text-gray-500">No image available</span>
          </div>
        )}
      </div>
      <div class="p-4">
        <h3 class="text-xl font-bold">
          {name}
        </h3>
        {model && <p class="text-gray-700 text-sm">{model}</p>}
        <div class="mt-4">
          <a
            href={`/car/${id}`}
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block text-center w-full"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
}