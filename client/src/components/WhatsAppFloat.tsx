import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhatsAppFloat() {
  const handleWhatsAppClick = () => {
    // Use environment variable with fallback for WhatsApp number
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "254700123456";
    const message = "Hi! I'm interested in your ICT hardware services.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Button
        onClick={handleWhatsAppClick}
        className="whatsapp-float bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg transition-all duration-300 hover:scale-110"
        size="icon"
        title="Contact us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
