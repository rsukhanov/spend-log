import AvatarBox from "@lib/components/Avatar";

export default function Home() {  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Spend Log</h1>
        <div className="flex items-center space-x-3">
          <AvatarBox />
        </div>
      </header>      
    </div>
  );
}