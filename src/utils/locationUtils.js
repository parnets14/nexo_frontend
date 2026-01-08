// Indian States and Union Territories with their codes
export const indianStates = [
  { code: 'AP', name: 'Andhra Pradesh', gstCode: '37' },
  { code: 'AR', name: 'Arunachal Pradesh', gstCode: '12' },
  { code: 'AS', name: 'Assam', gstCode: '18' },
  { code: 'BR', name: 'Bihar', gstCode: '10' },
  { code: 'CG', name: 'Chhattisgarh', gstCode: '22' },
  { code: 'GA', name: 'Goa', gstCode: '30' },
  { code: 'GJ', name: 'Gujarat', gstCode: '24' },
  { code: 'HR', name: 'Haryana', gstCode: '06' },
  { code: 'HP', name: 'Himachal Pradesh', gstCode: '02' },
  { code: 'JH', name: 'Jharkhand', gstCode: '20' },
  { code: 'KA', name: 'Karnataka', gstCode: '29' },
  { code: 'KL', name: 'Kerala', gstCode: '32' },
  { code: 'MP', name: 'Madhya Pradesh', gstCode: '23' },
  { code: 'MH', name: 'Maharashtra', gstCode: '27' },
  { code: 'MN', name: 'Manipur', gstCode: '14' },
  { code: 'ML', name: 'Meghalaya', gstCode: '17' },
  { code: 'MZ', name: 'Mizoram', gstCode: '15' },
  { code: 'NL', name: 'Nagaland', gstCode: '13' },
  { code: 'OR', name: 'Odisha', gstCode: '21' },
  { code: 'PB', name: 'Punjab', gstCode: '03' },
  { code: 'RJ', name: 'Rajasthan', gstCode: '08' },
  { code: 'SK', name: 'Sikkim', gstCode: '11' },
  { code: 'TN', name: 'Tamil Nadu', gstCode: '33' },
  { code: 'TS', name: 'Telangana', gstCode: '36' },
  { code: 'TR', name: 'Tripura', gstCode: '16' },
  { code: 'UP', name: 'Uttar Pradesh', gstCode: '09' },
  { code: 'UK', name: 'Uttarakhand', gstCode: '05' },
  { code: 'WB', name: 'West Bengal', gstCode: '19' },
  // Union Territories
  { code: 'AN', name: 'Andaman and Nicobar Islands', gstCode: '35' },
  { code: 'CH', name: 'Chandigarh', gstCode: '04' },
  { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', gstCode: '26' },
  { code: 'DL', name: 'Delhi', gstCode: '07' },
  { code: 'JK', name: 'Jammu and Kashmir', gstCode: '01' },
  { code: 'LA', name: 'Ladakh', gstCode: '38' },
  { code: 'LD', name: 'Lakshadweep', gstCode: '31' },
  { code: 'PY', name: 'Puducherry', gstCode: '34' }
]

// Major cities by state
export const citiesByState = {
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 
    'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani',
    'Ichalkaranji', 'Jalna', 'Ambajogai', 'Bhusawal'
  ],
  'Delhi': [
    'New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 
    'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi', 'Shahdara'
  ],
  'Karnataka': [
    'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 
    'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Gadag', 'Udupi'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 
    'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 
    'Anand', 'Navsari', 'Morbi', 'Mahesana', 'Bharuch', 'Vapi', 'Veraval', 'Godhra', 'Patan'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Bharatpur', 
    'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Baran', 'Dhaulpur', 'Tonk', 'Beawar'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 
    'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman', 'Kharagpur', 
    'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 
    'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Kothagudem'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 
    'Kakinada', 'Anantapur', 'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Tenali'
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 
    'Malappuram', 'Kannur', 'Kasaragod', 'Kottayam', 'Pathanamthitta', 'Idukki', 'Wayanad'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Firozpur', 'Batala', 
    'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala'
  ],
  'Haryana': [
    'Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 
    'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 
    'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 
    'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Saharsa', 'Hajipur', 'Sasaram'
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 
    'Baripada', 'Jharsuguda', 'Jeypore', 'Barbil', 'Khordha', 'Sunabeda', 'Rayagada'
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 
    'Karimganj', 'Sivasagar', 'Goalpara', 'Barpeta', 'Mangaldoi', 'Haflong', 'Diphu'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 
    'Ramgarh', 'Medininagar', 'Chirkunda', 'Chaibasa', 'Gumla', 'Dumka', 'Sahibganj'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 
    'Ambikapur', 'Mahasamund', 'Dhamtari', 'Chirmiri', 'Bhatapara', 'Dalli-Rajhara'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Kotdwar', 
    'Pithoragarh', 'Almora', 'Mussoorie', 'Nainital', 'Tehri', 'Pauri'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Nahan', 'Paonta Sahib', 
    'Sundernagar', 'Chamba', 'Una', 'Hamirpur', 'Bilaspur', 'Kullu', 'Manali'
  ],
  'Goa': [
    'Panaji', 'Vasco da Gama', 'Margao', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim', 
    'Cuncolim', 'Quepem', 'Cansaulim', 'Aldona', 'Cortalim'
  ]
}

// Utility functions
export const getStateByName = (stateName) => {
  return indianStates.find(state => state.name === stateName)
}

export const getStateByCode = (stateCode) => {
  return indianStates.find(state => state.code === stateCode)
}

export const getGSTCodeByState = (stateName) => {
  const state = getStateByName(stateName)
  return state ? state.gstCode : null
}

export const getCitiesByState = (stateName) => {
  return citiesByState[stateName] || []
}

export const isInterStateTransaction = (businessState, customerState) => {
  return businessState !== customerState
}

export const getGSTType = (businessState, customerState) => {
  return isInterStateTransaction(businessState, customerState) ? 'IGST' : 'SGST+CGST'
}

export const getAllStates = () => {
  return indianStates.map(state => state.name)
}

export const getAllCities = () => {
  return Object.values(citiesByState).flat()
}

export const searchCities = (query, state = null) => {
  const cities = state ? getCitiesByState(state) : getAllCities()
  return cities.filter(city => 
    city.toLowerCase().includes(query.toLowerCase())
  )
}

export const searchStates = (query) => {
  return indianStates.filter(state => 
    state.name.toLowerCase().includes(query.toLowerCase()) ||
    state.code.toLowerCase().includes(query.toLowerCase())
  )
}