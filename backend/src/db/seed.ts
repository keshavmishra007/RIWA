import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/supabase.js';
import { generateEmbedding } from '../services/embeddingService.js';

async function seedDatabase() {
  console.log('🌱 Starting complete RIWA Supabase Database Seed...');

  const supabase = getSupabase();
  if (!supabase) {
    console.error('❌ Supabase client is not connected. Please set valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env before seeding.');
    process.exit(1);
  }

  try {
    // 1. Seed Departments
    console.log('1️⃣ Seeding departments...');
    const departments = [
      { name: 'Municipal Engineering', code: 'municipal_engineering', description: 'Handles water drainage, sewers, and municipal construction' },
      { name: 'Sanitation', code: 'sanitation', description: 'Solid waste management and cleanliness' },
      { name: 'Public Works', code: 'public_works', description: 'Roads, bridges, and public pathways' },
      { name: 'Electrical', code: 'electrical', description: 'Street lighting and public electrical lines' },
    ];

    for (const dept of departments) {
      await supabase.from('departments').upsert(dept, { onConflict: 'code' });
    }

    const { data: deptData } = await supabase.from('departments').select('id, code');
    const deptMap: Record<string, string> = {};
    if (deptData) {
      deptData.forEach((d: any) => {
        deptMap[d.code] = d.id;
      });
    }

    // 2. Seed Demo Users
    console.log('2️⃣ Seeding demo users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo123', salt);

    const demoUsers = [
      { name: 'Rahul Sharma', email: 'citizen@riwa.demo', password_hash: passwordHash, role: 'CITIZEN' },
      { name: 'Dr. Priya Verma', email: 'authority@riwa.demo', password_hash: passwordHash, role: 'AUTHORITY' },
      { name: 'Admin User', email: 'admin@riwa.demo', password_hash: passwordHash, role: 'ADMIN' },
    ];

    for (const user of demoUsers) {
      await supabase.from('users').upsert(user, { onConflict: 'email' });
    }

    const { data: userData } = await supabase.from('users').select('id, email');
    const userMap: Record<string, string> = {};
    if (userData) {
      userData.forEach((u: any) => {
        userMap[u.email] = u.id;
      });
    }
    const citizenUserId = userMap['citizen@riwa.demo'] || null;
    const authorityUserId = userMap['authority@riwa.demo'] || null;

    // 3. Seed Initial Incidents
    console.log('3️⃣ Seeding initial incidents...');
    const initialIncidents = [
      {
        incident_code: 'INC-104',
        title: 'Waterlogging near Civil Lines Market',
        category: 'drainage',
        latitude: 24.5340,
        longitude: 81.2965,
        priority: 'CRITICAL',
        status: 'OPEN',
        fusion_confidence: 0.91,
        department_id: deptMap['municipal_engineering'] || null,
        summary: 'Severe waterlogging reported by multiple citizens near the Civil Lines Market area.',
        ai_brief: 'Multiple citizen reports indicate significant water accumulation around Market Road in Civil Lines area. Reports are geographically concentrated within 0.8 km and surging rapidly.',
        recommended_actions: [
          'Inspect drainage channel near Civil Lines Market',
          'Identify and clear blockage in main drain',
          'Deploy municipal water-pumping team',
          'Assess road accessibility for vehicles',
        ],
        report_count: 3,
        area_km: 0.8,
        trend: 'RAPIDLY_RISING',
      },
      {
        incident_code: 'INC-097',
        title: 'Electrical hazard near Government School',
        category: 'electrical_hazard',
        latitude: 24.5285,
        longitude: 81.3050,
        priority: 'CRITICAL',
        status: 'ASSIGNED',
        fusion_confidence: 0.88,
        department_id: deptMap['electrical'] || null,
        summary: 'Exposed and sparking electrical wire reported near Government School entrance.',
        ai_brief: 'Citizens report live sparking wires near Government School gate posing direct hazard to children. Immediate power cutoff recommended.',
        recommended_actions: [
          'Disconnect power to affected line immediately',
          'Deploy electrical repair crew to school area',
          'Install safety barriers around pole',
        ],
        report_count: 1,
        area_km: 0.3,
        trend: 'RISING',
      },
      {
        incident_code: 'INC-088',
        title: 'Road damage on NH-7 bypass stretch',
        category: 'road_damage',
        latitude: 24.5390,
        longitude: 81.2880,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        fusion_confidence: 0.85,
        department_id: deptMap['public_works'] || null,
        summary: 'Multiple large potholes and broken road surface reported on NH-7 bypass.',
        ai_brief: 'Heavy transit corridor damaged by recurring potholes, slowing traffic flow.',
        recommended_actions: [
          'Survey road damage extent on NH-7 bypass',
          'Deploy quick-mix bitumen repair team',
          'Install caution speed markers',
        ],
        report_count: 1,
        area_km: 1.2,
        trend: 'STABLE',
      },
    ];

    for (const inc of initialIncidents) {
      await supabase.from('incidents').upsert(inc, { onConflict: 'incident_code' });
    }

    const { data: incData } = await supabase.from('incidents').select('id, incident_code');
    const incMap: Record<string, string> = {};
    if (incData) {
      incData.forEach((i: any) => {
        incMap[i.incident_code] = i.id;
      });
    }

    const inc104Id = incMap['INC-104'];
    const inc097Id = incMap['INC-097'];
    const inc088Id = incMap['INC-088'];

    // 4. Seed Demo Complaints
    console.log('4️⃣ Seeding demo complaints with valid UUID relations...');
    const demoComplaints = [
      {
        complaint_code: 'R-201',
        user_id: citizenUserId,
        description: 'Road near Civil Lines Market is completely flooded. Water accumulating since morning.',
        raw_text: 'Road near Civil Lines Market is completely flooded. Water accumulating since morning.',
        latitude: 24.5342,
        longitude: 81.2963,
        category: 'drainage',
        status: 'IN_PROGRESS',
        incident_id: inc104Id,
      },
      {
        complaint_code: 'R-203',
        user_id: citizenUserId,
        description: 'Water has accumulated outside the market. Entire road under water.',
        raw_text: 'Water has accumulated outside the market. Entire road under water.',
        latitude: 24.5338,
        longitude: 81.2968,
        category: 'drainage',
        status: 'IN_PROGRESS',
        incident_id: inc104Id,
      },
      {
        complaint_code: 'R-207',
        user_id: citizenUserId,
        description: 'Drain overflow near the market road. Naali pura bhar gaya hai. Paani bohot jama hai.',
        raw_text: 'Drain overflow near the market road. Naali pura bhar gaya hai. Paani bohot jama hai.',
        latitude: 24.5335,
        longitude: 81.2970,
        category: 'drainage',
        status: 'IN_PROGRESS',
        incident_id: inc104Id,
      },
      {
        complaint_code: 'R-102',
        user_id: citizenUserId,
        description: 'Live sparking wire near Government School gate. Very dangerous for students.',
        raw_text: 'Live sparking wire near Government School gate. Very dangerous for students.',
        latitude: 24.5285,
        longitude: 81.3050,
        category: 'electrical_hazard',
        status: 'ASSIGNED',
        incident_id: inc097Id,
      },
      {
        complaint_code: 'R-103',
        user_id: citizenUserId,
        description: 'Deep potholes on NH-7 bypass road slowing down heavy traffic.',
        raw_text: 'Deep potholes on NH-7 bypass road slowing down heavy traffic.',
        latitude: 24.5390,
        longitude: 81.2880,
        category: 'road_damage',
        status: 'IN_PROGRESS',
        incident_id: inc088Id,
      },
    ];

    for (const comp of demoComplaints) {
      await supabase.from('complaints').upsert(comp, { onConflict: 'complaint_code' });
    }

    const { data: compData } = await supabase.from('complaints').select('id, complaint_code, description, category');
    const compMap: Record<string, any> = {};
    if (compData) {
      compData.forEach((c: any) => {
        compMap[c.complaint_code] = c;
      });
    }

    // 5. Seed AI Analyses with Semantic Embeddings
    console.log('5️⃣ Generating and seeding AI analyses with vector embeddings...');
    for (const code of ['R-201', 'R-203', 'R-207', 'R-102', 'R-103']) {
      const comp = compMap[code];
      if (comp) {
        let embedding: number[] | null = null;
        try {
          embedding = await generateEmbedding(comp.description);
        } catch {
          // fallback
        }

        await supabase.from('ai_analyses').upsert(
          {
            complaint_id: comp.id,
            category: comp.category,
            subcategory: comp.category === 'drainage' ? 'waterlogging' : comp.category === 'electrical_hazard' ? 'sparking_wire' : 'potholes',
            severity: comp.category === 'electrical_hazard' ? 'CRITICAL' : comp.category === 'drainage' ? 'HIGH' : 'MEDIUM',
            summary: comp.description,
            department: comp.category === 'drainage' ? 'Municipal Engineering' : comp.category === 'electrical_hazard' ? 'Electrical' : 'Public Works',
            confidence: 0.95,
            keywords: ['civic', comp.category],
            hazards: comp.category === 'electrical_hazard' ? ['live_wire'] : [],
            sensitive_locations: code.includes('102') ? ['school'] : ['market'],
            embedding,
          },
          { onConflict: 'complaint_id' }
        );
      }
    }

    // 6. Seed Incident Reports Associations with Real UUIDs
    console.log('6️⃣ Seeding explainable incident_reports associations...');
    if (inc104Id && compMap['R-201'] && compMap['R-203'] && compMap['R-207']) {
      const associations = [
        {
          incident_id: inc104Id,
          complaint_id: compMap['R-201'].id,
          fusion_score: 0.92,
          semantic_score: 0.90,
          location_score: 0.95,
          time_score: 0.88,
          category_score: 1.0,
        },
        {
          incident_id: inc104Id,
          complaint_id: compMap['R-203'].id,
          fusion_score: 0.89,
          semantic_score: 0.87,
          location_score: 0.93,
          time_score: 0.82,
          category_score: 1.0,
        },
        {
          incident_id: inc104Id,
          complaint_id: compMap['R-207'].id,
          fusion_score: 0.91,
          semantic_score: 0.89,
          location_score: 0.94,
          time_score: 0.82,
          category_score: 1.0,
        },
      ];

      for (const assoc of associations) {
        await supabase.from('incident_reports').upsert(assoc, { onConflict: 'incident_id,complaint_id' });
      }
    }

    if (inc097Id && compMap['R-102']) {
      await supabase.from('incident_reports').upsert(
        {
          incident_id: inc097Id,
          complaint_id: compMap['R-102'].id,
          fusion_score: 1.0,
          semantic_score: 1.0,
          location_score: 1.0,
          time_score: 1.0,
          category_score: 1.0,
        },
        { onConflict: 'incident_id,complaint_id' }
      );
    }

    if (inc088Id && compMap['R-103']) {
      await supabase.from('incident_reports').upsert(
        {
          incident_id: inc088Id,
          complaint_id: compMap['R-103'].id,
          fusion_score: 1.0,
          semantic_score: 1.0,
          location_score: 1.0,
          time_score: 1.0,
          category_score: 1.0,
        },
        { onConflict: 'incident_id,complaint_id' }
      );
    }

    // 7. Seed Status Logs for Incident Timeline
    console.log('7️⃣ Seeding incident audit status logs...');
    if (inc104Id) {
      const logs: Array<{
        incident_id: string;
        status: string;
        actor_id?: string | null;
        actor_name: string;
        note: string;
      }> = [
        {
          incident_id: inc104Id,
          status: 'OPEN',
          actor_id: null,
          actor_name: 'RIWA AI',
          note: 'Initial citizen report R-201 received and classified as drainage waterlogging',
        },
        {
          incident_id: inc104Id,
          status: 'OPEN',
          actor_id: null,
          actor_name: 'RIWA Fusion Engine',
          note: 'Related citizen reports R-203 and R-207 auto-fused into INC-104 with 91% confidence',
        },
        {
          incident_id: inc104Id,
          status: 'OPEN',
          actor_id: authorityUserId,
          actor_name: 'Dr. Priya Verma',
          note: 'Incident confirmed by authority. Awaiting municipal pumping crew dispatch.',
        },
      ];

      await supabase.from('status_logs').delete().eq('incident_id', inc104Id);
      for (const log of logs) {
        await supabase.from('status_logs').insert(log);
      }
    }

    // 8. Seed Hotspots
    console.log('8️⃣ Seeding civic hotspots...');
    const initialHotspots = [
      {
        hotspot_code: 'HS-01',
        label: 'Civil Lines Market Area',
        category: 'drainage',
        severity: 'CRITICAL',
        latitude: 24.5340,
        longitude: 81.2965,
        radius: 800,
        report_count: 18,
        incident_count: 2,
        trend: 'RAPIDLY_RISING',
      },
      {
        hotspot_code: 'HS-02',
        label: 'Government School Zone',
        category: 'electrical_hazard',
        severity: 'CRITICAL',
        latitude: 24.5285,
        longitude: 81.3050,
        radius: 300,
        report_count: 8,
        incident_count: 1,
        trend: 'RISING',
      },
      {
        hotspot_code: 'HS-03',
        label: 'NH-7 Bypass',
        category: 'road_damage',
        severity: 'HIGH',
        latitude: 24.5390,
        longitude: 81.2880,
        radius: 1200,
        report_count: 12,
        incident_count: 1,
        trend: 'STABLE',
      },
    ];

    for (const hs of initialHotspots) {
      await supabase.from('hotspots').upsert(hs, { onConflict: 'hotspot_code' });
    }

    console.log('✅ Supabase database seed completed successfully with complete relations!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  }
}

seedDatabase();
