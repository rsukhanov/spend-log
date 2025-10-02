import AvatarBox from "@lib/components/avatar-box";
import CurrencyModalExport from "@lib/components/currency-modal";
import Main from "@lib/components/main";

export default function Home() {  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background2 p-3">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-main">Spend Log</h1>
        <div className="flex items-center space-x-3">
          <CurrencyModalExport />
          <AvatarBox />
        </div>
      </header>
      <Main/>
    </div>
  );
}