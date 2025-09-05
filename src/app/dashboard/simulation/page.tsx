import { NfcSimulator } from '@/components/simulation/NfcSimulator';
import { sampleStories } from '@/lib/sample-data';

export default function SimulationPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <NfcSimulator stories={sampleStories} />
    </div>
  );
}
