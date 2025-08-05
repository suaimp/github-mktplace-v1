 
import { SponsoredBadge } from '../badges/SponsoredBadge';

// Simple test component to verify SponsoredBadge rendering
export function BadgeTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white' }}>
      <h3>Badge Test</h3>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span>Sim Badge:</span>
        <SponsoredBadge value="Sim" />
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
        <span>Não Badge:</span>
        <SponsoredBadge value="Não" />
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
        <span>Plain Sim:</span>
        <span>Sim</span>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
        <span>Plain Não:</span>
        <span>Não</span>
      </div>
    </div>
  );
}
