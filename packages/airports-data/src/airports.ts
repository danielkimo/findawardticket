export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

/**
 * 精選的主要機場清單，供出發地/目的地自動完成使用。
 * 這是一個「可替換」的靜態資料集：MVP 階段內建常用機場(涵蓋北美、歐洲、亞洲、
 * 拉丁美洲等 LifeMiles/Avianca 常見航點)，避免依賴外部 API 或金鑰。
 * 未來若需要更完整的機場資料，可以匯入完整的 OpenFlights airports.dat 並沿用相同的
 * Airport 介面與 searchAirports() 函式，不需修改呼叫端程式碼。
 */
export const AIRPORTS: Airport[] = [
  { iata: "TPE", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan" },
  { iata: "TSA", name: "Taipei Songshan Airport", city: "Taipei", country: "Taiwan" },
  { iata: "KHH", name: "Kaohsiung International Airport", city: "Kaohsiung", country: "Taiwan" },
  { iata: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong" },
  { iata: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan" },
  { iata: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan" },
  { iata: "KIX", name: "Kansai International Airport", city: "Osaka", country: "Japan" },
  { iata: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
  { iata: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China" },
  { iata: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China" },
  { iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
  { iata: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { iata: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia" },
  { iata: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines" },
  { iata: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia" },
  { iata: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India" },
  { iata: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India" },
  { iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates" },
  { iata: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar" },
  { iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { iata: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { iata: "LGW", name: "Gatwick Airport", city: "London", country: "United Kingdom" },
  { iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { iata: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  { iata: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands" },
  { iata: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain" },
  { iata: "BCN", name: "Barcelona–El Prat Airport", city: "Barcelona", country: "Spain" },
  { iata: "FCO", name: "Leonardo da Vinci–Fiumicino Airport", city: "Rome", country: "Italy" },
  { iata: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland" },
  { iata: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria" },
  { iata: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal" },
  { iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States" },
  { iata: "EWR", name: "Newark Liberty International Airport", city: "Newark", country: "United States" },
  { iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States" },
  { iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States" },
  { iata: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States" },
  { iata: "MIA", name: "Miami International Airport", city: "Miami", country: "United States" },
  { iata: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States" },
  { iata: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States" },
  { iata: "ATL", name: "Hartsfield–Jackson Atlanta International Airport", city: "Atlanta", country: "United States" },
  { iata: "SEA", name: "Seattle–Tacoma International Airport", city: "Seattle", country: "United States" },
  { iata: "DEN", name: "Denver International Airport", city: "Denver", country: "United States" },
  { iata: "IAD", name: "Washington Dulles International Airport", city: "Washington, D.C.", country: "United States" },
  { iata: "BOS", name: "Logan International Airport", city: "Boston", country: "United States" },
  { iata: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada" },
  { iata: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada" },
  { iata: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico" },
  { iata: "CUN", name: "Cancún International Airport", city: "Cancún", country: "Mexico" },
  { iata: "GDL", name: "Guadalajara International Airport", city: "Guadalajara", country: "Mexico" },
  { iata: "SJO", name: "Juan Santamaría International Airport", city: "San José", country: "Costa Rica" },
  { iata: "PTY", name: "Tocumen International Airport", city: "Panama City", country: "Panama" },
  { iata: "SAL", name: "Monseñor Óscar Arnulfo Romero International Airport", city: "San Salvador", country: "El Salvador" },
  { iata: "GUA", name: "La Aurora International Airport", city: "Guatemala City", country: "Guatemala" },
  { iata: "SJU", name: "Luis Muñoz Marín International Airport", city: "San Juan", country: "Puerto Rico" },
  { iata: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia" },
  { iata: "MDE", name: "José María Córdova International Airport", city: "Medellín", country: "Colombia" },
  { iata: "CLO", name: "Alfonso Bonilla Aragón International Airport", city: "Cali", country: "Colombia" },
  { iata: "CTG", name: "Rafael Núñez International Airport", city: "Cartagena", country: "Colombia" },
  { iata: "UIO", name: "Mariscal Sucre International Airport", city: "Quito", country: "Ecuador" },
  { iata: "GYE", name: "José Joaquín de Olmedo International Airport", city: "Guayaquil", country: "Ecuador" },
  { iata: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru" },
  { iata: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile" },
  { iata: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina" },
  { iata: "AEP", name: "Jorge Newbery Airfield", city: "Buenos Aires", country: "Argentina" },
  { iata: "GRU", name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil" },
  { iata: "GIG", name: "Rio de Janeiro/Galeão International Airport", city: "Rio de Janeiro", country: "Brazil" },
  { iata: "BSB", name: "Brasília International Airport", city: "Brasília", country: "Brazil" },
  { iata: "CCS", name: "Simón Bolívar International Airport", city: "Caracas", country: "Venezuela" },
  { iata: "MVD", name: "Carrasco International Airport", city: "Montevideo", country: "Uruguay" },
  { iata: "ASU", name: "Silvio Pettirossi International Airport", city: "Asunción", country: "Paraguay" },
  { iata: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia" },
  { iata: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia" },
  { iata: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand" },
  { iata: "JNB", name: "O.R. Tambo International Airport", city: "Johannesburg", country: "South Africa" },
  { iata: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa" },
  { iata: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt" },
];

/**
 * 依關鍵字(機場代碼、城市名稱、機場名稱)搜尋機場，供前端自動完成使用。
 * 比對規則採不分大小寫的子字串比對，IATA 代碼完全相符會排在最前面。
 */
export function searchAirports(query: string, limit = 10): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches = AIRPORTS.filter(
    (airport) =>
      airport.iata.toLowerCase().includes(q) ||
      airport.city.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q) ||
      airport.country.toLowerCase().includes(q),
  );

  matches.sort((a, b) => {
    const aExact = a.iata.toLowerCase() === q ? 0 : 1;
    const bExact = b.iata.toLowerCase() === q ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;

    const aStarts = a.iata.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.iata.toLowerCase().startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;

    return a.city.localeCompare(b.city);
  });

  return matches.slice(0, limit);
}

export function findAirportByIata(iata: string): Airport | undefined {
  const code = iata.trim().toUpperCase();
  return AIRPORTS.find((airport) => airport.iata === code);
}
