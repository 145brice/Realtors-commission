import AgentDetailPage from '@/components/AgentDetailPage';

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentDetailPage agentId={id} />;
}
