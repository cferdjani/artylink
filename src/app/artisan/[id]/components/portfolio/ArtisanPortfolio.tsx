"use client";

import { ImageIcon, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type PortfolioItem = {
  id: string;
  caption: string | null;
  image_url: string;
  created_at: string;
};

interface ArtisanPortfolioProps {
  items: PortfolioItem[];
  artisanName: string;
}

export default function ArtisanPortfolio({ items, artisanName }: ArtisanPortfolioProps) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <ImageIcon className="text-gray-400" size={24} />
        </div>
        <h3 className="text-gray-900 font-medium">Aucune réalisation publiée</h3>
        <p className="text-gray-500 text-sm mt-1">
          {artisanName} n'a pas encore partagé de photos de son travail.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-gray-900">
        Portfolio & Réalisations
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square cursor-pointer shadow-sm border border-gray-200"
            onClick={() => setSelectedItem(item)}
          >
            <Image
              src={item.image_url}
              alt={item.caption || "Sans titre"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-white font-medium truncate">{item.caption || "Sans titre"}</h4>
                  <p className="text-gray-300 text-xs line-clamp-1">{item.caption}</p>
                </div>
                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm text-white">
                  <Maximize2 size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image side */}
            <div className="relative w-full md:w-2/3 aspect-video bg-gray-100">
              <Image
                src={selectedItem.image_url}
                alt={selectedItem.caption || "Sans titre"}
                fill
                className="object-contain"
              />
            </div>
            
            {/* Details side */}
            <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col border-l border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedItem.caption || "Sans titre"}</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    Publié le {new Date(selectedItem.created_at).toLocaleDateString('fr-DZ')}
                  </p>
                </div>
              </div>
              
              <div className="prose prose-sm text-gray-600 flex-grow">
                {selectedItem.caption ? (
                  <p>{selectedItem.caption}</p>
                ) : (
                  <p className="italic text-gray-400">Aucune description fournie pour cette réalisation.</p>
                )}
              </div>
              
              <button 
                onClick={() => setSelectedItem(null)}
                className="mt-8 w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
