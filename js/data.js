const KZN_DATA = {
  locations: [
    {
      id: "krantzkloof",
      name: "Krantzkloof Nature Reserve",
      slug: "krantzkloof-nature-reserve",
      tagline: "Dramatic gorge, crowned eagles & cascading falls",
      description: "Krantzkloof is one of KZN's most spectacular reserves, featuring the magnificent Molweni River gorge, Kloof Falls, and dense coastal scarp forest. Home to crowned eagles, forest buzzards, and over 300 bird species. The towering cliffs and river valleys offer some of the most challenging and rewarding trails in Durban.",
      hectares: 484,
      location: "Kloof / Pinetown",
      management: "Ezemvelo KZN Wildlife",
      coordinates: { lat: -29.7784, lng: 30.8369 },
      payment_method: "Card Only",
      entry_fee_adult: 60,
      entry_fee_child: 21,
      parking_type: "Fenced Guarded Interior",
      parking_notes: "Fenced, guarded lots at Kloof Falls and Nkutu Picnic Sites",
      hours: "07:00 – 17:00 Daily",
      phone: "+27 31 764 3514",
      website: null,
      tags: ["Hiking", "Birdwatching", "Waterfalls", "Gorge", "Photography"],
      hazards: ["Steep cliffs", "Flash floods in gorge", "Slippery paths when wet"],
      regulations: ["No pets allowed", "No alcohol", "No loud music", "No geocaching", "No cash accepted"],
      attractions: ["Kloof Falls", "Molweni River", "Crowned Eagles", "Forest Buzzards", "Beacon Trail"],
      reviews: [
        { user: "TrailRunner_KZN", date: "2026-05-28", safety: 4, parking: 5, cleanliness: 5, cost: 3, environmental: 3, comment: "Stunning reserve. The Molweni trail is challenging but worth every step. Card only at the gate – don't arrive with cash! Gorgeous waterfalls after good rain." },
        { user: "BirdwatcherDbn", date: "2026-05-15", safety: 5, parking: 5, cleanliness: 4, cost: 4, environmental: 3, comment: "Spotted two Crowned Eagles on the ridge trail. Security has improved massively with the new rangers. Highly recommend the early morning walks." },
        { user: "FamilyHikers_ZA", date: "2026-04-30", safety: 4, parking: 4, cleanliness: 4, cost: 4, environmental: 4, comment: "Great family day out. Kids loved the waterfall. Trail was well marked. Bring a credit card – they really do not take cash. Beautiful forest." }
      ],
      alerts: [
        { category: "Flash Flood", severity: "Medium", details: "Molweni River crossing may be impassable after heavy rain. Check conditions at the gate before attempting lower gorge trails.", active: true }
      ],
      photo: "https://images.unsplash.com/photo-1469022563148-aa0dde2a6c1e?w=1000&h=500&fit=crop",
      photoCredit: "Photo: Unsplash",
      images: ["krantzkloof1", "krantzkloof2"],
      featured: true
    },
    {
      id: "giba-gorge",
      name: "Giba Gorge MTB Park",
      slug: "giba-gorge-mtb-park",
      tagline: "World-class single-tracks in a stunning valley",
      description: "Giba Gorge is Durban's premier privately-owned mountain biking destination, featuring over 45km of professionally designed and maintained single-track trails winding through a lush gorge. The park includes a licensed restaurant (Giba Graze Café), bike hire, and pristine ablution facilities. Perfect for trail runners and outdoor enthusiasts too.",
      hectares: null,
      location: "Pinetown / New Germany",
      management: "Private Commercial",
      coordinates: { lat: -29.8012, lng: 30.8756 },
      payment_method: "Cash & Card",
      entry_fee_adult: 70,
      entry_fee_child: 50,
      parking_type: "Fenced Guarded Interior",
      parking_notes: "Fully secured, access-controlled gated private parking lot",
      hours: "07:00 – 17:00 (Closed Tuesdays)",
      phone: "+27 31 700 1080",
      website: null,
      tags: ["Mountain Biking", "Trail Running", "Café", "Family", "Dog Friendly"],
      hazards: ["Technical MTB trails – beginners should start on green routes"],
      regulations: ["Dogs must remain on leash at all times", "No outside food or catering", "No alcohol brought in", "No open braais"],
      attractions: ["45km+ single-track network", "Giba Gorge waterfalls", "Giba Graze Café", "Bike hire facilities", "Kids' trails"],
      reviews: [
        { user: "MTBRider_Dbn", date: "2026-05-25", safety: 5, parking: 5, cleanliness: 5, cost: 3, environmental: 5, comment: "Best MTB trails in KZN without question. The new black diamond descent is heart-pumping. Café food is excellent. Worth every cent of the entry fee." },
        { user: "TrailRunner_SA", date: "2026-05-10", safety: 5, parking: 5, cleanliness: 5, cost: 3, environmental: 5, comment: "Ran the full 45km network over two visits. Immaculate trail maintenance. Parking is Fort Knox-level secure. Highly recommend for solo runners." },
        { user: "WeekendAdventurer", date: "2026-04-20", safety: 5, parking: 5, cleanliness: 4, cost: 2, environmental: 5, comment: "Absolutely beautiful gorge. A bit pricey but the infrastructure justifies it. No cash? No problem – tap-and-go available. Bring the whole family." }
      ],
      alerts: [],
      photo: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&h=500&fit=crop",
      photoCredit: "Photo: Unsplash",
      images: ["giba1", "giba2"],
      featured: true
    },
    {
      id: "palmiet",
      name: "Palmiet Nature Reserve",
      slug: "palmiet-nature-reserve",
      tagline: "Free urban forest & accessible river walks",
      description: "Palmiet Nature Reserve is Westville's hidden green gem — 90 hectares of dense scarp forest and indigenous bush along the Palmiet River. One of the few free nature reserves in Durban with wheelchair-accessible cement paths near the entrance. Perfect for family walks, birdwatching, and photography.",
      hectares: 90,
      location: "Dawncrest, Westville",
      management: "eThekwini Municipality & Community Committee",
      coordinates: { lat: -29.8285, lng: 30.9012 },
      payment_method: "Free",
      entry_fee_adult: 0,
      entry_fee_child: 0,
      parking_type: "Guarded Public Lot",
      parking_notes: "Guarded community lot at Edgecliff Road administrative hall",
      hours: "06:00 – 17:30 Daily",
      phone: "+27 31 265 5487",
      website: null,
      tags: ["Free", "Family", "Birdwatching", "Accessible", "River Walk"],
      hazards: ["Slippery clay slopes after rain", "River crossings can flood after heavy rain", "Fallen trees post-storm"],
      regulations: ["Keep to marked paths", "No littering", "Donations encouraged to support maintenance"],
      attractions: ["Palmiet River", "Scarp forest canopy walks", "Cement accessible paths", "Bird hides", "Picnic spots"],
      reviews: [
        { user: "WestvilleMom", date: "2026-06-01", safety: 4, parking: 4, cleanliness: 4, cost: 5, environmental: 4, comment: "Perfect free Saturday morning walk with the kids. The cement path near the entrance is great for young children. Reserve staff are friendly and helpful." },
        { user: "BirdPhotographer", date: "2026-05-18", safety: 3, parking: 4, cleanliness: 3, cost: 5, environmental: 3, comment: "Beautiful birds but trail maintenance needs attention after recent floods. Some paths blocked by fallen trees. Still worth the visit – and it's FREE!" },
        { user: "MorningWalker_DBN", date: "2026-04-05", safety: 4, parking: 4, cleanliness: 4, cost: 5, environmental: 4, comment: "My daily morning walk spot. River path is magical at dawn. Guard at the gate is very reassuring for solo walkers. Can't believe this is free." }
      ],
      alerts: [
        { category: "Trail Obstruction", severity: "Low", details: "Several fallen trees on the upper river path after recent storms. The lower cement path and entrance trails are fully clear.", active: true }
      ],
      photo: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&h=500&fit=crop",
      photoCredit: "Photo: Unsplash",
      images: ["palmiet1", "palmiet2"],
      featured: false
    },
    {
      id: "paradise-valley",
      name: "Paradise Valley Nature Reserve",
      slug: "paradise-valley-nature-reserve",
      tagline: "Historic waterworks & hidden waterfall trail",
      description: "Paradise Valley is one of Durban's most scenic hidden gems, featuring the historic Umbilo Waterworks, a dramatic waterfall trail, and resident blue duikers. The reserve runs along the Umbilo River in Pinetown, offering a cool, forested escape from the city. Note: upstream water pollution means swimming is prohibited.",
      hectares: 135,
      location: "Pinetown",
      management: "eThekwini Municipality",
      coordinates: { lat: -29.8456, lng: 30.8623 },
      payment_method: "Cash & Card",
      entry_fee_adult: 21,
      entry_fee_child: 10,
      parking_type: "Fenced Guarded Interior",
      parking_notes: "Secured interior lot; heavily constrained on weekends – arrive early",
      hours: "07:00 – 17:00 Daily",
      phone: "+27 31 700 5000",
      website: null,
      tags: ["Waterfall", "History", "Wildlife", "Photography", "Budget"],
      hazards: ["Upstream water pollution – no swimming", "Weekend parking severely limited", "Highway construction noise"],
      regulations: ["No swimming in river", "No feeding wildlife", "Keep dogs on leash"],
      attractions: ["Historic Umbilo Waterworks", "Waterfall Trail", "Blue Duiker sightings", "Umbilo River path", "Forest canopy"],
      reviews: [
        { user: "HistoryBuff_KZN", date: "2026-05-22", safety: 3, parking: 3, cleanliness: 3, cost: 5, environmental: 2, comment: "The historic waterworks ruins are fascinating. Trail to the waterfall is beautiful. Go on a weekday – weekend parking is chaos and fills up fast." },
        { user: "NaturePhotog_DBN", date: "2026-05-01", safety: 3, parking: 2, cleanliness: 3, cost: 5, environmental: 2, comment: "Spectacular waterfall for photography. Got great duiker shots too. Parking was full on Saturday so had to park on the road outside – not ideal. River water looks dirty." },
        { user: "WalkingClub_ZA", date: "2026-03-15", safety: 4, parking: 3, cleanliness: 3, cost: 5, environmental: 3, comment: "Lovely walk through indigenous forest. Historical infrastructure is unique. Water pollution is a visible problem. Construction noise from the highway is disruptive." }
      ],
      alerts: [
        { category: "Water Pollution", severity: "High", details: "Upstream sewer overflow detected. High E. coli levels in the Umbilo River. Swimming and wading is strictly prohibited until further notice.", active: true }
      ],
      photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&h=500&fit=crop",
      photoCredit: "Photo: Unsplash",
      images: ["paradise1", "paradise2"],
      featured: false
    },
    {
      id: "kenneth-stainbank",
      name: "Kenneth Stainbank Nature Reserve",
      slug: "kenneth-stainbank-nature-reserve",
      tagline: "Zebras, impala & bat caves near the city",
      description: "Kenneth Stainbank is Durban's most biodiverse urban nature reserve — 253 hectares of open grasslands and riverine forest in Yellowwood Park, home to resident zebras, impala, wildebeest, and over 200 bird species. The only urban reserve in KZN where you can walk among free-roaming large mammals. Don't leave valuables in your car — cheeky monkeys have learned to open doors!",
      hectares: 253,
      location: "Yellowwood Park, Durban South",
      management: "Ezemvelo KZN Wildlife",
      coordinates: { lat: -29.9156, lng: 30.9234 },
      payment_method: "Cash & Card",
      entry_fee_adult: 60,
      entry_fee_child: 21,
      parking_type: "Fenced Guarded Interior",
      parking_notes: "Heavily secured, gated parking lot inside the main entrance – extremely safe",
      hours: "06:00 – 18:00 Daily",
      phone: "+27 31 462 1394",
      website: null,
      tags: ["Wildlife", "Birdwatching", "Walking", "Family", "Zebra"],
      hazards: ["Vervet monkeys can open unlocked car doors – lock everything", "Stay on paths near large mammals"],
      regulations: ["Lock car doors at all times", "No pets allowed", "Stay on marked trails near wildlife", "No feeding animals"],
      attractions: ["Free-roaming Zebra herd", "Impala & Wildebeest", "Over 200 bird species", "Historic bat colony caves", "Riverine forest trails"],
      reviews: [
        { user: "ZebraScout_DBN", date: "2026-05-30", safety: 5, parking: 5, cleanliness: 5, cost: 3, environmental: 5, comment: "Zebras walking right past you on the path! Kids were absolutely amazed. Parking is the most secure in Durban – staff guard the lot personally. Don't forget to lock your car!" },
        { user: "MorningBirdwatcher", date: "2026-05-12", safety: 5, parking: 5, cleanliness: 4, cost: 3, environmental: 5, comment: "Incredible birding. Spotted 34 species in 2 hours. The grassland trails at sunrise are magical with wildebeest in the mist. Security is excellent." },
        { user: "FamilyDay_KZN", date: "2026-04-18", safety: 5, parking: 5, cleanliness: 5, cost: 3, environmental: 5, comment: "Best family outing in Durban. My kids couldn't believe the zebras were just walking around freely. Immaculate reserve. Secure, well-run, and reasonably priced." }
      ],
      alerts: [],
      photo: "https://images.unsplash.com/photo-1606471191009-63159ec98341?w=1000&h=500&fit=crop",
      photoCredit: "Photo: Unsplash",
      images: ["stainbank1", "stainbank2"],
      featured: true
    },
    {
      id: "burman-bush",
      name: "Burman Bush Nature Reserve",
      slug: "burman-bush-nature-reserve",
      tagline: "Coastal forest & bird hides in Morningside",
      description: "Burman Bush is a 50-hectare coastal forest reserve in the heart of Morningside, Durban. After a comprehensive security upgrade — including perimeter fencing, access-controlled gates, daily dog patrols, and on-site rangers — the reserve has seen a major resurgence in visitors. A quiet sanctuary for birdwatchers, morning walkers, and photography enthusiasts.",
      hectares: 50,
      location: "Morningside, Durban",
      management: "eThekwini Municipality",
      coordinates: { lat: -29.8412, lng: 31.0156 },
      payment_method: "Free",
      entry_fee_adult: 0,
      entry_fee_child: 0,
      parking_type: "Guarded Public Lot",
      parking_notes: "Guarded entry gate with active security personnel",
      hours: "06:00 – 18:00 Daily",
      phone: "+27 31 303 4160",
      website: null,
      tags: ["Free", "Birdwatching", "Coastal Forest", "Walking", "Photography"],
      hazards: ["Hike in groups, especially on weekends – historic safety issues now resolved with security upgrade"],
      regulations: ["Hike in groups recommended on weekends", "Keep dogs on leash", "No littering"],
      attractions: ["Coastal scarp forest", "Bird-watching hides", "Interpretive trails", "Dog patrol routes", "Morningside forest canopy"],
      reviews: [
        { user: "BirderMorningside", date: "2026-06-01", safety: 4, parking: 4, cleanliness: 4, cost: 5, environmental: 4, comment: "Security upgrade has transformed this reserve! Dog patrols visible throughout. Spotted hadedas, sunbirds, and a fiscal shrike at the hide. Highly recommend." },
        { user: "DailyWalker_DBN", date: "2026-05-20", safety: 4, parking: 4, cleanliness: 4, cost: 5, environmental: 4, comment: "Go early for the best bird sightings. The new fencing and guards make it feel very safe now. Much better than a few years ago. Free and beautiful." },
        { user: "InterpretiveTrailFan", date: "2026-05-02", safety: 3, parking: 3, cleanliness: 3, cost: 5, environmental: 4, comment: "Interpretive trail signs need updating. Some information boards are damaged. But the forest itself is lovely. Security definitely improved. Walk in groups to be safe." }
      ],
      alerts: [],
      photo: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1000&h=500&fit=crop",
      photoCredit: "Photo: Unsplash",
      images: ["burman1", "burman2"],
      featured: false
    },
    {
      id: "giba-gorge-ggep",
      name: "Giba Gorge Environmental Precinct (GGEP)",
      slug: "giba-gorge-environmental-precinct",
      tagline: "400ha of community-protected scarp forest",
      description: "The Giba Gorge Environmental Precinct is a non-profit community conservation project covering 400 hectares of high-biodiversity scarp forest and open grasslands. Secured by the Winston Park Guardians who run regular security patrols. Free access with donation encouraged. Separate from the MTB Park – this is the wild, natural corridor of the gorge.",
      hectares: 400,
      location: "Winston Park, Pinetown",
      management: "Non-Profit Community (Winston Park Guardians)",
      coordinates: { lat: -29.7923, lng: 30.8534 },
      payment_method: "Free",
      entry_fee_adult: 0,
      entry_fee_child: 0,
      parking_type: "Guarded Public Lot",
      parking_notes: "Community-managed parking with volunteer guardian oversight",
      hours: "Sunrise – Sunset Daily",
      phone: null,
      website: null,
      tags: ["Free", "Conservation", "Hiking", "Birdwatching", "Community"],
      hazards: ["Some unmarked trails – download map before visiting", "Steep gorge terrain"],
      regulations: ["Donations strongly encouraged to fund guardian patrols", "Leave no trace", "No fires"],
      attractions: ["400ha natural scarp forest", "Community guardian patrols", "High biodiversity", "Natural gorge views", "Birding hotspot"],
      reviews: [
        { user: "ConservationHiker", date: "2026-05-25", safety: 4, parking: 3, cleanliness: 5, cost: 5, environmental: 5, comment: "Incredible that this is free. The Winston Park Guardians do an amazing job keeping it safe and clean. Donate generously – these volunteers deserve support." },
        { user: "NaturalistKZN", date: "2026-05-08", safety: 4, parking: 3, cleanliness: 5, cost: 5, environmental: 5, comment: "Found 3 rare orchid species on the gorge slopes! The community management model is inspirational. Dense, beautiful forest. Some trails are rough – bring good shoes." }
      ],
      alerts: [],
      photo: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&h=500&fit=crop",
      photoCredit: "Photo: Unsplash",
      images: ["ggep1", "ggep2"],
      featured: false
    }
  ]
};

// Calculate weighted desirability index
function calculateDesirabilityIndex(location) {
  if (!location.reviews || location.reviews.length === 0) return 3.0;

  const n = location.reviews.length;
  const avg = (key) => location.reviews.reduce((s, r) => s + r[key], 0) / n;

  const S = avg('safety');
  const P = avg('parking');
  const C = avg('cleanliness');
  const F = avg('cost');
  const E = avg('environmental');

  // D_i = ws*S + wp*P + we*E + wc*C - wf*F
  const D = (0.35 * S) + (0.25 * P) + (0.15 * E) + (0.15 * C) - (0.10 * F);
  return Math.round(D * 100) / 100;
}

function getAverageScore(location, key) {
  if (!location.reviews || location.reviews.length === 0) return 0;
  return Math.round(location.reviews.reduce((s, r) => s + r[key], 0) / location.reviews.length * 10) / 10;
}

// Enrich locations with computed scores
KZN_DATA.locations.forEach(loc => {
  loc.desirabilityIndex = calculateDesirabilityIndex(loc);
  loc.avgSafety = getAverageScore(loc, 'safety');
  loc.avgParking = getAverageScore(loc, 'parking');
  loc.avgCleanliness = getAverageScore(loc, 'cleanliness');
  loc.avgCost = getAverageScore(loc, 'cost');
  loc.avgEnvironmental = getAverageScore(loc, 'environmental');
  loc.activeAlerts = loc.alerts.filter(a => a.active).length;
  loc.reviewCount = loc.reviews.length;
});
