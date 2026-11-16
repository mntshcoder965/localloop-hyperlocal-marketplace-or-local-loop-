export interface PincodeRecord {
  pincode: string;
  locality: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export const INDIAN_PINCODES: Record<string, PincodeRecord> = {
  // Bengaluru
  '560001': { pincode: '560001', locality: 'MG Road / Bangalore GPO', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9784, longitude: 77.6046 },
  '560025': { pincode: '560025', locality: 'Richmond Town / Shanthi Nagar', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9667, longitude: 77.5983 },
  '560034': { pincode: '560034', locality: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9352, longitude: 77.6245 },
  '560038': { pincode: '560038', locality: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9719, longitude: 77.6412 },
  '560041': { pincode: '560041', locality: 'Jayanagar', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9308, longitude: 77.5838 },
  '560066': { pincode: '560066', locality: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9698, longitude: 77.7499 },
  '560068': { pincode: '560068', locality: 'BTM Layout / Madiwala', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9166, longitude: 77.6101 },
  '560076': { pincode: '560076', locality: 'Bannerghatta Road', city: 'Bengaluru', state: 'Karnataka', latitude: 12.8954, longitude: 77.5988 },
  '560078': { pincode: '560078', locality: 'JP Nagar', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9063, longitude: 77.5857 },
  '560095': { pincode: '560095', locality: 'Koramangala 8th Block', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9423, longitude: 77.6198 },
  '560100': { pincode: '560100', locality: 'Electronic City Phase 1', city: 'Bengaluru', state: 'Karnataka', latitude: 12.8399, longitude: 77.6770 },
  '560102': { pincode: '560102', locality: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9121, longitude: 77.6446 },
  '560103': { pincode: '560103', locality: 'Bellandur / Outer Ring Road', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9260, longitude: 77.6762 },
  '560004': { pincode: '560004', locality: 'Basavanagudi', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9416, longitude: 77.5755 },
  '560003': { pincode: '560003', locality: 'Malleswaram', city: 'Bengaluru', state: 'Karnataka', latitude: 13.0031, longitude: 77.5703 },

  // Mumbai
  '400001': { pincode: '400001', locality: 'Fort / Colaba', city: 'Mumbai', state: 'Maharashtra', latitude: 18.9322, longitude: 72.8347 },
  '400050': { pincode: '400050', locality: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', latitude: 19.0596, longitude: 72.8295 },
  '400053': { pincode: '400053', locality: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1363, longitude: 72.8277 },
  '400058': { pincode: '400058', locality: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1136, longitude: 72.8697 },
  '400076': { pincode: '400076', locality: 'Powai', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1176, longitude: 72.9060 },
  '400049': { pincode: '400049', locality: 'Juhu', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1075, longitude: 72.8263 },

  // Delhi NCR
  '110001': { pincode: '110001', locality: 'Connaught Place', city: 'New Delhi', state: 'Delhi', latitude: 28.6304, longitude: 77.2177 },
  '110016': { pincode: '110016', locality: 'Hauz Khas / Green Park', city: 'New Delhi', state: 'Delhi', latitude: 28.5494, longitude: 77.2001 },
  '110049': { pincode: '110049', locality: 'South Extension', city: 'New Delhi', state: 'Delhi', latitude: 28.5728, longitude: 77.2215 },
  '122001': { pincode: '122001', locality: 'Cyber City / DLF Phase 2', city: 'Gurugram', state: 'Haryana', latitude: 28.4871, longitude: 77.0898 },
  '201301': { pincode: '201301', locality: 'Sector 18 / Film City', city: 'Noida', state: 'Uttar Pradesh', latitude: 28.5708, longitude: 77.3271 },

  // Hyderabad
  '500081': { pincode: '500081', locality: 'HITEC City / Madhapur', city: 'Hyderabad', state: 'Telangana', latitude: 17.4474, longitude: 78.3762 },
  '500032': { pincode: '500032', locality: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', latitude: 17.4401, longitude: 78.3489 },
  '500034': { pincode: '500034', locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', latitude: 17.4156, longitude: 78.4357 },
  '500033': { pincode: '500033', locality: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', latitude: 17.4319, longitude: 78.4073 },

  // Pune
  '411057': { pincode: '411057', locality: 'Hinjawadi Infotech Park', city: 'Pune', state: 'Maharashtra', latitude: 18.5913, longitude: 73.7389 },
  '411014': { pincode: '411014', locality: 'Viman Nagar', city: 'Pune', state: 'Maharashtra', latitude: 18.5679, longitude: 73.9143 },
  '411006': { pincode: '411006', locality: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', latitude: 18.5484, longitude: 73.9035 },
  '411004': { pincode: '411004', locality: 'FC Road / Shivajinagar', city: 'Pune', state: 'Maharashtra', latitude: 18.5314, longitude: 73.8446 },

  // Chennai
  '600028': { pincode: '600028', locality: 'Raja Annamalaipuram', city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0238, longitude: 80.2520 },
  '600096': { pincode: '600096', locality: 'OMR / Perungudi', city: 'Chennai', state: 'Tamil Nadu', latitude: 12.9654, longitude: 80.2461 },
  '600042': { pincode: '600042', locality: 'Velachery', city: 'Chennai', state: 'Tamil Nadu', latitude: 12.9815, longitude: 80.2180 },

  // Kolkata
  '700091': { pincode: '700091', locality: 'Salt Lake Sector V', city: 'Kolkata', state: 'West Bengal', latitude: 22.5804, longitude: 88.4378 },
  '700019': { pincode: '700019', locality: 'Ballygunge', city: 'Kolkata', state: 'West Bengal', latitude: 22.5280, longitude: 88.3656 },
  '700156': { pincode: '700156', locality: 'New Town Action Area 1', city: 'Kolkata', state: 'West Bengal', latitude: 22.5867, longitude: 88.4754 },
};

