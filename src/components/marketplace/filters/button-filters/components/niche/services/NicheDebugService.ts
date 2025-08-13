/**
 * Debug service for testing niche data extraction
 */

export class NicheDebugService {
  static debugEntries(entries: any[]) {
    console.log('=== NICHE DEBUG START ===');
    console.log('Total entries:', entries.length);
    
    entries.slice(0, 5).forEach((entry, index) => {
      console.log(`\n--- Entry ${index} ---`);
      console.log('Full entry:', entry);
      
      if (entry.values) {
        console.log('Entry values:', entry.values);
        
        Object.entries(entry.values).forEach(([fieldId, fieldValue]) => {
          console.log(`  Field ${fieldId}:`, fieldValue);
          
          // Check if it might be a niche field
          const isNicheRelated = /niche|nicho|categoria|category|segmento|segment|area|tema|theme|topic|topico|mercado|market/i.test(fieldId);
          if (isNicheRelated) {
            console.log(`  ⭐ POTENTIAL NICHE FIELD: ${fieldId}`, fieldValue);
          }
        });
      }
    });
    
    console.log('=== NICHE DEBUG END ===');
  }
}
