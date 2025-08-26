import { ChatButton } from './components/ChatButton';

export default function ChatButtonTestStandalone() {
  // Testa o ChatButton fora do map, com orderItemId fixo
  return (
    <div style={{ padding: 32 }}>
      <h2>Teste ChatButton Standalone</h2>
      <ChatButton orderItemId="123456" onOpenChat={() => alert('open chat!')} />
    </div>
  );
}
