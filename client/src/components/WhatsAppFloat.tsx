import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhatsAppFloat() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "+254700123456";
  
  const openWhatsApp = () => {
    const message = "Hi! I'm interested in your ICT hardware services and would like to learn more.";
    const url = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Button
      onClick={openWhatsApp}
      className="fixed bottom-6 left-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-40"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}