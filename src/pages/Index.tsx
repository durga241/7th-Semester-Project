import FarmConnectMarketplace from "@/components/FarmConnectMarketplace";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <ErrorBoundary>
        <FarmConnectMarketplace />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
