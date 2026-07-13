export const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof', 'Rev', 'Alhaji', 'Madam'];
export const QUALIFICATIONS = ['Certificate', 'Diploma', 'B.Ed', 'B.A', 'B.Sc', 'M.Ed', 'M.A', 'M.Sc', 'PhD'];
export const MARITAL_STATUSES = ['single', 'married', 'divorced', 'widowed', 'separated'];
export const EMPLOYMENT_STATUSES = ['active', 'retired', 'terminated', 'on_leave', 'suspended'];
// Ghana Education Service rank ladder, lowest to highest — must stay in
// this exact order and match the ladder in ges/src/controllers/
// promotionController.js, since that's what drives promotion eligibility.
export const GRADES = [
  'Pupil Teacher', 'Superintendent II', 'Superintendent I',
  'Senior Superintendent II', 'Senior Superintendent I', 'Principal Superintendent',
  'Assistant Director II', 'Assistant Director I', 'Deputy Director',
  'Director II', 'Director I', 'Deputy Director-General', 'Director-General',
];
export const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
  'Savannah', 'Bono East', 'Ahafo', 'Western North', 'Oti', 'North East'
];
export const GHANA_INSTITUTIONS = [
  // Universities
  'University of Ghana, Legon',
  'Kwame Nkrumah University of Science and Technology (KNUST)',
  'University of Cape Coast (UCC)',
  'University of Education, Winneba (UEW)',
  'University for Development Studies (UDS)',
  'University of Health and Allied Sciences (UHAS)',
  'University of Mines and Technology (UMaT)',
  'University of Professional Studies, Accra (UPSA)',
  'Ghana Institute of Management and Public Administration (GIMPA)',
  'University of Environment and Sustainable Development (UESD)',
  'SD Dombo University of Business and Integrated Development Studies',
  'C.K. Tedam University of Technology and Applied Sciences',
  'Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development (AAMUSTED)',
  // Technical Universities
  'Accra Technical University',
  'Cape Coast Technical University',
  'Ho Technical University',
  'Koforidua Technical University',
  'Kumasi Technical University',
  'Sunyani Technical University',
  'Takoradi Technical University',
  'Tamale Technical University',
  'Wa Technical University',
  // Colleges of Education
  'Aburi Girls College of Education',
  'Accra College of Education',
  'Agogo Presbyterian College of Education',
  'Akatsi College of Education',
  'Asante Akyem College of Education',
  'Assin Fosu College of Education',
  'Bagabaga College of Education',
  'Berekum College of Education',
  'Bimbilla College of Education',
  'Dambai College of Education',
  'Enchi College of Education',
  'Foso College of Education',
  'Gbewaa College of Education (Navrongo)',
  'Gbewaa College of Education (Pusiga)',
  'Holy Child College of Education',
  'Jasikan College of Education',
  'Kibi Presbyterian College of Education',
  'Kpando College of Education',
  'Mampong Technical College of Education',
  'Methodist College of Education, Abeadze',
  'Mount Mary College of Education',
  'Nkoranza College of Education',
  'OLA College of Education',
  'Offinso College of Education',
  'Peki College of Education',
  'Presbyterian College of Education, Akropong',
  'Presbyterian Women\'s College of Education, Aburi',
  'St. Ambrose College of Education',
  'St. Francis College of Education',
  'St. John Bosco\'s College of Education',
  'St. Joseph\'s College of Education, Bechem',
  'St. Louis College of Education',
  'St. Monica\'s College of Education',
  'St. Teresa\'s College of Education',
  'Tumu College of Education',
  'Wesley College of Education',
  'Wiawso College of Education',
  // Other institutions
  'Central University, Accra',
  'Ghana Christian University College',
  'Ghana Communication Technology University',
  'Ghana Institute of Journalism (GIJ)',
  'Ghana Technology University College',
  'Lancaster University Ghana',
  'Mountcrest University College',
  'Pentecost University',
  'Presbyterian University College Ghana',
  'Regent University College of Science and Technology',
  'Trinity Theological Seminary',
  'Valley View University',
  'Wisconsin International University College, Ghana',
].sort();

export const GHANA_SCHOOLS = [
  // A
  'Abeadze Dominase SHS', 'Abetifi Secondary School', 'Aburi Girls SHS', 'Accra Academy',
  'Accra Girls SHS', 'Accra Technical Training Centre', 'Achimota School',
  'Adeiso Presbyterian SHS', 'Adisadel College', 'Afife SHS', 'Agogo Presbyterian SHS',
  'Aggrey Memorial AME Zion SHS', 'Ahafo Ano SHS', 'Ahantaman Girls SHS',
  'Akim Aburi Girls SHS', 'Akim Oda SHS', 'Akim Swedru SHS', 'Akosombo International School',
  'Akropong SHS', 'Akuapem SHS', 'Akuse SHS', 'Akyem Abuakwa SHS',
  'Akyem Asafo SHS', 'Akyem Manso SHS', 'Akyim Oda SHS', 'Alatsi SHS',
  'Amansie SHS', 'Amamoma SHS', 'Amenfiman SHS', 'Anum Presbyterian SHS',
  'Anyanui SHS', 'Aowin SHS', 'Apam SHS', 'Apowa SHS',
  'Archbishop Porter Girls SHS', 'Asanteman SHS', 'Assin Bereku SHS',
  'Assin Fosu College of Education', 'Assin North Municipal SHS', 'Assin State College',
  'Asante Akyem SHS', 'Asante Mampong SHS', 'Atebubu SHS', 'Atimatim SHS',
  'Ave Maria SHS', 'Aviation SHS', 'Awudome SHS',
  // B
  'Bagabaga College of Education', 'Bawku SHS', 'Bechem SHS', 'Berekum SHS',
  'Bibiani SHS', 'Bishop Herman College', 'Bishop Bowers SHS', 'Bia Lamplighter SHS',
  'Bole SHS', 'Bolgatanga SHS', 'Bolgatanga Technical Institute',
  'Bonzali SHS', 'Bortianor SHS', 'Bosome Freho SHS', 'Breman Asikuma SHS',
  // C
  'Cape Coast SHS', 'Cape Coast Technical Institute', 'Catholic SHS Battor',
  'Catholic SHS Koforidua', 'Chiraa SHS', 'Chiana SHS', 'Christ the King SHS',
  'Corpus Christi SHS', 'Creche International School',
  // D
  'Dambai College of Education', 'Damongo SHS', 'Denu SHS', 'Dompim SHS',
  'Dormaa SHS', 'Drobo SHS', 'Duayaw Nkwanta SHS', 'Dzolali SHS',
  // E
  'Ebenezer SHS', 'Effiduase SHS', 'Ejisu SHS', 'Ejura Sekyedumasi SHS',
  'Enchi College of Education', 'Esiam SHS', 'Esiama SHS',
  // F
  'Feyiase SHS', 'Fijai SHS', 'Fomena SHS', 'Frafraha SHS',
  // G
  'Gbewaa College of Education', 'Ghana National College', 'Ghana SHS Navrongo',
  'Ghana Senior High Technical School Tamale', 'Goaso SHS', 'Gomoa Eshiem SHS',
  'Gonga SHS',
  // H
  'Half Assini SHS', 'Heman SHS', 'Ho SHS', 'Ho Technical Institute',
  'Holy Child School', 'Holy Family SHS Techiman',
  // J
  'James Town SHS', 'Jasikan College of Education', 'Jasikan SHS', 'Jema SHS',
  'Juabeng SHS', 'Juapong Technical Institute', 'Juaso SHS',
  // K
  'Kaleo SHS', 'Kaneshie SHS', 'Kasoa SHS', 'Keta SHS',
  'Kibi Government SHS', 'Kintampo SHS', 'Koforidua Secondary Technical School',
  'Koforidua SHS', 'Kpandu SHS', 'Krachie SHS', 'Krobo Girls SHS',
  'Kukuom SHS', 'Kumasi Academy', 'Kumasi Girls SHS', 'Kumasi Polytechnic Practice SHS',
  'Kumasi Technical Institute', 'Kumbungu SHS', 'Kwabre SHS', 'Kwahu SHS',
  // L
  'La Bone SHS', 'Labone SHS', 'Lawra SHS', 'Legon SHS',
  'Lolobi SHS', 'Loyola SHS',
  // M
  'Mamfe Akuapem SHS', 'Mankessim SHS', 'Manhyia SHS', 'Mawuli School',
  'Methodist SHS Berekum', 'Methodist SHS Ho', 'Methodist SHS Kumasi',
  'Mfantsiman Girls SHS', 'Mfantsipim School', 'Mpasatia SHS', 'Mpohor SHS',
  'Mt. Mary College of Education', 'Mumuadu SHS',
  // N
  'Nalerigu SHS', 'Nandom SHS', 'Navrongo SHS', 'New Juaben SHS',
  'Nkawkaw SHS', 'Nkwanta SHS', 'Nkonya SHS', 'Nkoranza SHS',
  'North East Garu SHS', 'Northern School of Business', 'Nsawam SHS',
  'Nsutaman Catholic SHS', 'Ntotroso SHS', 'Nyankpala Agricultural College',
  // O
  'Odorgonno SHS', 'OLA Girls SHS Ho', 'Okuapeman SHS', 'Osei Kyeretwie SHS',
  'Osei Tutu SHS', 'Our Lady of Apostles SHS',
  // P
  'Peki SHS', 'Pepease SHS', 'Pong Tamale SHS', 'Pope John SHS',
  'Prempeh College', 'Presbyterian Boys SHS Legon (PRESEC)',
  'Presbyterian Girls SHS Aburi', 'Presbyterian SHS Abetifi',
  'Presbyterian SHS Krobo', 'Presby SHS Akropong',
  // R
  'Ramseyer SHS', 'Ridge Church School', 'Roman Ridge SHS',
  // S
  'Sacred Heart SHS Nalerigu', 'SDA SHS Bekwai', 'Secondi College',
  'Sekondi College', 'Sefwi Wiawso SHS', 'Sene SHS', 'Serwaa Nyarko Girls SHS',
  'Sogakope SHS', 'St. Augustine\'s College', 'St. Francis Xavier SHS Afosu',
  'St. James SHS', 'St. John\'s School Sekondi', 'St. Joseph\'s SHS',
  'St. Louis SHS Kumasi', 'St. Mary\'s SHS Accra', 'St. Monica\'s SHS',
  'St. Peter\'s SHS', 'St. Roses SHS', 'Sunyani SHS', 'Sunyani Technical Institute',
  // T
  'Tamale Girls SHS', 'Tamale SHS', 'Tamale Technical Institute',
  'Tarkwa SHS', 'Techiman SHS', 'Tepa SHS', 'Tema Secondary School',
  'Tema Technical Institute', 'Tolon SHS', 'Tsito SHS', 'Twenedurase SHS',
  // U
  'University Practice SHS Cape Coast', 'University Practice SHS Legon',
  // V
  'Volta River Authority SHS',
  // W
  'Wa Girls SHS', 'Wa SHS', 'Walewale SHS', 'Wesley Girls High School',
  'Wenchi Methodist SHS', 'Weta SHS', 'Wiawso SHS',
  // Y
  'Yaa Asantewaa Girls SHS', 'Yeji SHS',
  // Z
  'Zebilla SHS',
].sort();

export const NATIONALITIES = [
  'Ghanaian', 'Nigerian', 'Togolese', 'Ivorian', 'Burkinabe', 'Beninese',
  'Liberian', 'Sierra Leonean', 'Senegalese', 'Malian', 'Gambian', 'Guinean',
  'South African', 'Kenyan', 'Egyptian', 'British', 'American', 'Canadian',
  'Indian', 'Chinese', 'Lebanese', 'Other'
];
