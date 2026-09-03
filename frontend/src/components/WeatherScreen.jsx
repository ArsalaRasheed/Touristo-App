import React, { useState, useEffect } from 'react';

const WeatherScreen = () => {
  const [location, setLocation] = useState("Islamabad");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Coordinates for major Pakistani cities
  const cityCoordinates = {
    "Islamabad": { lat: 33.6844, lon: 73.0479 },
    "Karachi": { lat: 24.8607, lon: 67.0011 },
    "Lahore": { lat: 31.5546, lon: 74.3572 },
    "Peshawar": { lat: 34.0151, lon: 71.5249 },
    "Quetta": { lat: 30.1798, lon: 66.9750 },
    "Multan": { lat: 30.1975, lon: 71.4734 },
    "Rawalpindi": { lat: 33.5972, lon: 73.0435 },
    "Faisalabad": { lat: 31.4167, lon: 73.0833 },
    "Gujranwala": { lat: 32.1551, lon: 74.1877 },
    "Hyderabad": { lat: 25.3924, lon: 68.3737 },
    "Sialkot": { lat: 32.4956, lon: 74.5375 },
    "Sukkur": { lat: 27.7211, lon: 68.8655 },
    "Larkana": { lat: 27.5583, lon: 68.2111 },
    "Nawabshah": { lat: 26.2472, lon: 68.4108 },
    "Chiniot": { lat: 31.7167, lon: 72.9833 },
    "Kasur": { lat: 31.1250, lon: 74.1167 },
    "Okara": { lat: 30.8033, lon: 73.4489 },
    "Sahiwal": { lat: 30.6667, lon: 73.1167 },
    "Sheikhupura": { lat: 31.7167, lon: 73.9833 },
    "Mirpur Khas": { lat: 25.5283, lon: 69.0111 },
    "Jhang": { lat: 31.2667, lon: 72.3167 },
    "Kohat": { lat: 33.5850, lon: 71.4472 },
    "Mardan": { lat: 34.1978, lon: 72.0436 },
    "Khanewal": { lat: 30.3031, lon: 71.9550 },
    "Gojra": { lat: 30.9167, lon: 72.8833 },
    "Bahawalpur": { lat: 29.3956, lon: 71.6722 },
    "Abbottabad": { lat: 34.1461, lon: 73.2186 },
    "Mingora": { lat: 34.7742, lon: 72.3743 },
    "Dera Ghazi Khan": { lat: 30.0500, lon: 70.6333 },
    "Sargodha": { lat: 32.0833, lon: 72.6833 },
    "Khuzdar": { lat: 27.7950, lon: 66.6350 },
    "Chakwal": { lat: 32.9333, lon: 72.8833 },
    "Jacobabad": { lat: 28.2778, lon: 68.4444 },
    "Shikarpur": { lat: 27.9833, lon: 68.6167 },
    "Charsadda": { lat: 34.1778, lon: 71.7200 },
    "Swabi": { lat: 34.1422, lon: 72.4817 },
    "Nowshera": { lat: 34.0147, lon: 71.9708 },
    "Kamber Shahdadkot": { lat: 27.5667, lon: 68.5833 },
    "Karak": { lat: 33.1167, lon: 71.0833 },
    "Mansehra": { lat: 34.3333, lon: 73.2000 },
    "Upper Dir": { lat: 35.3333, lon: 72.1667 },
    "Lower Dir": { lat: 34.9500, lon: 72.2667 },
    "Hangu": { lat: 33.5333, lon: 71.0500 },
    "Tank": { lat: 32.3167, lon: 70.5000 },
    "Bannu": { lat: 32.9833, lon: 70.6000 },
    "Kohlu": { lat: 29.9500, lon: 69.5833 },
    "Zhob": { lat: 31.3500, lon: 69.4667 },
    "Gwadar": { lat: 25.1263, lon: 62.3250 },
    "Chitral": { lat: 35.8500, lon: 71.7833 },
    "Skardu": { lat: 35.3219, lon: 75.5962 },
    "Gilgit": { lat: 35.9208, lon: 74.3037 },
    "Hunza": { lat: 36.2833, lon: 74.4833 },
    "Swat": { lat: 35.0000, lon: 72.5000 },
    "Malam Jabba": { lat: 34.9667, lon: 72.4000 },
    "Naran": { lat: 35.3333, lon: 73.4000 },
    "Kaghan": { lat: 35.2000, lon: 73.2333 },
    "Thatta": { lat: 24.7667, lon: 67.9167 },
    "Badin": { lat: 24.9500, lon: 68.8333 },
    "Sujawal": { lat: 24.9000, lon: 68.5500 },
    "Tando Allahyar": { lat: 25.4500, lon: 68.7167 },
    "Matli": { lat: 24.8000, lon: 68.7333 },
    "Dadu": { lat: 26.7333, lon: 67.7500 },
    "Jamshoro": { lat: 25.4333, lon: 68.2833 },
    "Matiari": { lat: 25.6833, lon: 68.4500 },
    "Tando Muhammad Khan": { lat: 25.2833, lon: 68.4667 },
    "Naushahro Feroze": { lat: 26.2167, lon: 68.1333 },
    "Mehar": { lat: 27.1833, lon: 68.3333 },
    "Kandhkot": { lat: 28.3833, lon: 69.0833 },
    "Ratodero": { lat: 27.7333, lon: 68.5000 },
    "Kashmore": { lat: 28.4333, lon: 70.5833 },
    "Usta Muhammad": { lat: 28.7000, lon: 69.1500 },
    "Adilabad": { lat: 27.4500, lon: 68.9000 },
    "Garhi Khairo": { lat: 27.8167, lon: 68.6333 },
    "Kotri": { lat: 25.3833, lon: 68.3833 },
    "Sakrand": { lat: 26.5167, lon: 68.0333 },
    "Nasirabad": { lat: 26.8000, lon: 68.1833 },
    "Qambar": { lat: 27.5167, lon: 68.6833 },
    "Shahdadkot": { lat: 27.6167, lon: 68.5167 },
    "Miro Khan": { lat: 27.4000, lon: 68.4000 },
    "Khipro": { lat: 26.7833, lon: 68.2667 },
    "Larkana": { lat: 27.5583, lon: 68.2111 },
    "Kamber": { lat: 27.5667, lon: 68.5833 },
    "Shikarpur": { lat: 27.9833, lon: 68.6167 },
    "Khairpur": { lat: 27.5333, lon: 68.7833 },
    "Sanghar": { lat: 25.9833, lon: 69.0333 },
    "Mirpur Mathelo": { lat: 27.1333, lon: 69.1667 },
    "Naushahro Feroze": { lat: 26.2167, lon: 68.1333 },
    "Matiari": { lat: 25.6833, lon: 68.4500 },
    "Tando Adam": { lat: 25.7667, lon: 68.7000 },
    "Sujawal": { lat: 24.9000, lon: 68.5500 },
    "Thatta": { lat: 24.7667, lon: 67.9167 },
    "Badin": { lat: 24.9500, lon: 68.8333 },
    "Tando Allahyar": { lat: 25.4500, lon: 68.7167 },
    "Matli": { lat: 24.8000, lon: 68.7333 },
    "Diplo": { lat: 25.1667, lon: 69.5167 },
    "Chachro": { lat: 24.7333, lon: 69.7167 },
    "Islamkot": { lat: 25.2833, lon: 69.3667 },
    "Nagarparkar": { lat: 25.0833, lon: 70.3167 },
    "Khokhrapar": { lat: 24.9667, lon: 70.1167 },
    "Sindhri": { lat: 25.6500, lon: 68.9667 },
    "Mirpur Khas": { lat: 25.5283, lon: 69.0111 },
    "Tando Jam": { lat: 25.8167, lon: 68.7167 },
    "Digri": { lat: 25.1500, lon: 69.1000 },
    "Matiari": { lat: 25.6833, lon: 68.4500 },
    "Oderolal Station": { lat: 25.7333, lon: 68.6667 },
    "Shahpur Chakar": { lat: 26.0500, lon: 68.6000 },
    "Kot Diji": { lat: 27.8667, lon: 68.6667 },
    "Kotri": { lat: 25.3833, lon: 68.3833 },
    "Landhi": { lat: 24.9000, lon: 67.0333 },
    "Malir Cantonment": { lat: 24.9833, lon: 67.1667 },
    "Korangi": { lat: 24.9167, lon: 67.0667 },
    "Gulshan": { lat: 24.9333, lon: 67.0667 },
    "Defence": { lat: 24.8833, lon: 67.0833 },
    "Clifton": { lat: 24.8000, lon: 67.0333 },
    "Saddar": { lat: 24.8500, lon: 67.0167 },
    "Cantt": { lat: 24.9833, lon: 67.1667 },
    "North Nazimabad": { lat: 24.9667, lon: 67.0667 },
    "Nazimabad": { lat: 24.9500, lon: 67.0500 },
    "Gulberg": { lat: 24.8667, lon: 67.0500 },
    "Askari": { lat: 24.8833, lon: 67.1000 },
    "Model Colony": { lat: 24.9167, lon: 67.0833 },
    "University Road": { lat: 24.8333, lon: 67.0500 },
    "Shahrah-e-Faisal": { lat: 24.8667, lon: 67.0833 },
    "Garden": { lat: 24.8167, lon: 67.0333 },
    "Civil Lines": { lat: 24.8667, lon: 67.0333 },
    "Anarkali": { lat: 31.5833, lon: 74.3167 },
    "Mall Road": { lat: 31.5833, lon: 74.3167 },
    "Gulberg": { lat: 31.5500, lon: 74.3333 },
    "Model Town": { lat: 31.5167, lon: 74.3167 },
    "DHA": { lat: 31.4833, lon: 74.3333 },
    "Muslim Town": { lat: 31.5333, lon: 74.3167 },
    "Township": { lat: 31.4667, lon: 74.2667 },
    "Cavalry Ground": { lat: 31.5667, lon: 74.3167 },
    "Shalimar": { lat: 31.5667, lon: 74.3667 },
    "Ichhra": { lat: 31.5333, lon: 74.2833 },
    "Samnabad": { lat: 31.5167, lon: 74.3000 },
    "Kharakanas": { lat: 31.4833, lon: 74.2833 },
    "Aziz Bhatti Town": { lat: 31.4500, lon: 74.2667 },
    "Ravi Town": { lat: 31.5000, lon: 74.2500 },
    "Nishtar Town": { lat: 31.4667, lon: 74.2500 },
    "Allama Iqbal Town": { lat: 31.4833, lon: 74.2500 },
    "Wapda Town": { lat: 31.4667, lon: 74.2833 },
    "Shah Alam Market": { lat: 31.5667, lon: 74.3167 },
    "Lahore Cantt": { lat: 31.5500, lon: 74.3667 },
    "Raja Bazaar": { lat: 31.5833, lon: 74.3167 },
    "Anarkali": { lat: 31.5833, lon: 74.3167 },
    "Fortress Stadium": { lat: 31.5667, lon: 74.3333 },
    "Badami Bagh": { lat: 31.5333, lon: 74.3500 },
    "Wagha": { lat: 31.5167, lon: 74.3833 },
    "Kashmiri Chowk": { lat: 31.5833, lon: 74.3167 },
    "Bank Square": { lat: 31.5667, lon: 74.3167 },
    "Mochi Gate": { lat: 31.5667, lon: 74.3167 },
    "Delhi Gate": { lat: 31.5667, lon: 74.3167 },
    "Bhatta Chowk": { lat: 31.5667, lon: 74.3167 },
    "Ranipura": { lat: 31.5667, lon: 74.3167 },
    "Mian Muhammad Bakhsh Colony": { lat: 31.5667, lon: 74.3167 },
    "Begum Kot": { lat: 31.5667, lon: 74.3167 },
    "Shahdra": { lat: 31.5167, lon: 74.2833 },
    "Samanabad": { lat: 31.5167, lon: 74.3000 },
    "Saddar": { lat: 31.5667, lon: 74.3167 },
    "Circular Road": { lat: 31.5667, lon: 74.3167 },
    "Lawrence Road": { lat: 31.5667, lon: 74.3167 },
    "Coventry Green": { lat: 31.5667, lon: 74.3167 },
    "Ghazi Road": { lat: 31.5667, lon: 74.3167 },
    "Liberty Market": { lat: 31.5667, lon: 74.3167 },
    "Johar Town": { lat: 31.4667, lon: 74.2833 },
    "Iqbal Town": { lat: 31.5000, lon: 74.2500 },
    "Gulshan-e-Iqbal": { lat: 24.8833, lon: 67.0667 },
    "Buffer Zone": { lat: 24.8833, lon: 67.0667 },
    "Federal B Area": { lat: 24.8833, lon: 67.0667 },
    "I.I. Chundrigar Road": { lat: 24.8500, lon: 67.0167 },
    "Sir Shah Sufi Road": { lat: 24.8500, lon: 67.0167 },
    "Dr. Ziauddin Ahmed Road": { lat: 24.8500, lon: 67.0167 },
    "Frere Hall": { lat: 24.8500, lon: 67.0167 },
    "Empress Market": { lat: 24.8500, lon: 67.0167 },
    "Kharadar": { lat: 24.8500, lon: 67.0167 },
    "Saddar Town": { lat: 24.8500, lon: 67.0167 },
    "Clifton Block": { lat: 24.8000, lon: 67.0333 },
    "Koelcri": { lat: 24.8000, lon: 67.0333 },
    "KDA Scheme 1": { lat: 24.8000, lon: 67.0333 },
    "Shah Faisal Colony": { lat: 24.9167, lon: 67.0667 },
    "PECHS": { lat: 24.9000, lon: 67.0500 },
    "Gulistan-e-Jauhar": { lat: 24.9333, lon: 67.1000 },
    "Gulshan-e-Maymar": { lat: 24.9167, lon: 67.1000 },
    "Gulshan-e-Hadeed": { lat: 24.9167, lon: 67.1000 },
    "Rashid Minhas Road": { lat: 24.9167, lon: 67.1000 },
    "North Karachi": { lat: 24.9667, lon: 67.0667 },
    "Landhi Town": { lat: 24.9000, lon: 67.0333 },
    "Baldia Town": { lat: 24.9000, lon: 67.0333 },
    "Bin Qasim Town": { lat: 24.9000, lon: 67.0333 },
    "Gadap Town": { lat: 24.9000, lon: 67.0333 },
    "Kiamari Town": { lat: 24.8000, lon: 67.0333 },
    "Lyari Town": { lat: 24.8000, lon: 67.0333 },
    "Malir Town": { lat: 24.9833, lon: 67.1667 },
    "Saddar Karachi": { lat: 24.8500, lon: 67.0167 },
    "Gulshan-e-Iqbal Town": { lat: 24.8833, lon: 67.0667 },
    "Gulberg III": { lat: 24.8833, lon: 67.0667 },
    "Pir Ilahi Buksh Colony": { lat: 24.8833, lon: 67.0667 },
    "Zamzama": { lat: 24.8833, lon: 67.0667 },
    "Dhoraji": { lat: 24.8833, lon: 67.0667 },
    "Hafeezpet": { lat: 24.8833, lon: 67.0667 },
    "Hyderi": { lat: 24.9333, lon: 67.1000 },
    "Saima Colony": { lat: 24.9333, lon: 67.1000 },
    "Buffer Zone II": { lat: 24.9333, lon: 67.1000 },
    "M.A. Jinnah Road": { lat: 24.8500, lon: 67.0167 },
    "Pakistan Chowk": { lat: 24.8500, lon: 67.0167 },
    "Water Pump": { lat: 24.8500, lon: 67.0167 },
    "Korangi Creek": { lat: 24.9000, lon: 67.0667 },
    "Shah Nawaz Bhutto Road": { lat: 24.9000, lon: 67.0667 },
    "Surjani Town": { lat: 24.9667, lon: 67.0667 },
    "Shah Faisal Town": { lat: 24.9167, lon: 67.0667 },
    "Malir Cantonment": { lat: 24.9833, lon: 67.1667 },
    "Airport": { lat: 24.9000, lon: 67.1667 },
    "Jinnah Hospital": { lat: 24.9000, lon: 67.0667 },
    "Millennium Mall": { lat: 24.9000, lon: 67.0667 },
    "Saddar": { lat: 24.8500, lon: 67.0167 },
    "University of Karachi": { lat: 24.9167, lon: 67.0667 },
    "NIPA": { lat: 24.8833, lon: 67.0667 },
    "Gulshan-e-Hadeed": { lat: 24.9167, lon: 67.1000 },
    "Gulshan-e-Ghazi": { lat: 24.9167, lon: 67.1000 },
    "Bahria Town": { lat: 24.9167, lon: 67.1000 },
    "Korangi Industrial Area": { lat: 24.9000, lon: 67.0667 },
    "Landhi Industrial Area": { lat: 24.9000, lon: 67.0333 },
    "S.I.T.E. Industrial Area": { lat: 24.9000, lon: 67.0667 },
    "Port Qasim": { lat: 24.8000, lon: 67.1667 },
    "Keti Bandar": { lat: 24.7333, lon: 67.1667 },
    "Manghopir": { lat: 24.9667, lon: 67.0667 },
    "Azizabad": { lat: 24.8500, lon: 67.0167 },
    "Mubarak Village": { lat: 24.9000, lon: 67.0667 },
    "Gulshan-e-Shahbaz": { lat: 24.8833, lon: 67.0667 },
    "Khayaban-e-Shahbaz": { lat: 24.8833, lon: 67.0667 },
    "Khayaban-e-Ittehad": { lat: 24.8833, lon: 67.0667 },
    "Korangi Sector 33": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 35": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 36": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 37": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 38": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 39": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 40": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 41": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 42": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 43": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 44": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 45": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 46": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 47": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 48": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 49": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 50": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 51": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 52": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 53": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 54": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 55": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 56": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 57": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 58": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 59": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 60": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 61": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 62": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 63": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 64": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 65": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 66": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 67": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 68": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 69": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 70": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 71": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 72": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 73": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 74": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 75": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 76": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 77": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 78": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 79": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 80": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 81": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 82": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 83": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 84": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 85": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 86": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 87": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 88": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 89": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 90": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 91": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 92": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 93": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 94": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 95": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 96": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 97": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 98": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 99": { lat: 24.9000, lon: 67.0667 },
    "Korangi Sector 100": { lat: 24.9000, lon: 67.0667 }
  };

  // Function to fetch weather data
  const fetchWeatherData = async () => {
    if (!cityCoordinates[location]) {
      setError("Location not available. Please select from the list.");
      setWeatherData(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const coords = cityCoordinates[location];
      const response = await fetch(`http://localhost:3000/api/weather/coordinates?lat=${coords.lat}&lon=${coords.lon}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setWeatherData(result.data.weather);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Using default location.');
      // Fallback to Islamabad
      const fallbackCoords = cityCoordinates["Islamabad"];
      try {
        const response = await fetch(`http://localhost:3000/api/weather/coordinates?lat=${fallbackCoords.lat}&lon=${fallbackCoords.lon}`);
        if (response.ok) {
          const result = await response.json();
          setWeatherData(result.data.weather);
        }
      } catch (fallbackErr) {
        console.error('Error fetching fallback weather data:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather data when component mounts or location changes
  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  // Function to get weather icon based on openweathermap codes
  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': '☀️',   // Clear sky day
      '01n': '🌙',   // Clear sky night
      '02d': '⛅',   // Few clouds day
      '02n': '☁️',   // Few clouds night
      '03d': '☁️',   // Scattered clouds day
      '03n': '☁️',   // Scattered clouds night
      '04d': '☁️',   // Broken clouds day
      '04n': '☁️',   // Broken clouds night
      '09d': '🌧️',   // Shower rain day
      '09n': '🌧️',   // Shower rain night
      '10d': '🌦️',   // Rain day
      '10n': '🌧️',   // Rain night
      '11d': '⛈️',   // Thunderstorm day
      '11n': '⛈️',   // Thunderstorm night
      '13d': '❄️',   // Snow day
      '13n': '❄️',   // Snow night
      '50d': '🌫️',   // Mist day
      '50n': '🌫️'    // Mist night
    };
    return iconMap[iconCode] || '🌈'; // Default icon
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center text-[color:var(--text-primary)]">Weather Forecast</h1>
        <p className="text-[color:var(--text-secondary)] mb-6 text-center">Check weather conditions for your trip</p>
        
        <div className="mb-8">
          <div className="flex justify-center">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full max-w-md p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] text-center"
            >
              {Object.keys(cityCoordinates).map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        ) : weatherData ? (
          <>
            {/* Current Weather */}
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-8 text-center border border-[color:var(--border-primary)]">
              <h2 className="text-2xl font-bold mb-2 text-[color:var(--text-primary)]">{location}</h2>
              <div className="text-6xl mb-4">{getWeatherIcon(weatherData.icon)}</div>
              <div className="text-5xl font-bold mb-2 text-[color:var(--text-primary)]">{weatherData.temperature}°C</div>
              <div className="text-xl text-[color:var(--text-secondary)] mb-4 capitalize">{weatherData.description}</div>
              
              <div className="flex justify-center gap-8 mt-6">
                <div className="text-center">
                  <div className="text-[color:var(--text-secondary)]">Feels Like</div>
                  <div className="text-xl font-bold text-[color:var(--text-primary)]">{weatherData.feelsLike}°C</div>
                </div>
                <div className="text-center">
                  <div className="text-[color:var(--text-secondary)]">Humidity</div>
                  <div className="text-xl font-bold text-[color:var(--text-primary)]">{weatherData.humidity}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[color:var(--text-secondary)]">Wind</div>
                  <div className="text-xl font-bold text-[color:var(--text-primary)]">{weatherData.windSpeed} km/h</div>
                </div>
              </div>
            </div>
            
            {/* 5-Day Forecast */}
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
              <h2 className="text-2xl font-bold mb-6 text-[color:var(--text-primary)]">5-Day Forecast</h2>
              
              <div className="space-y-4">
                {weatherData.forecast?.map((day, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-[color:var(--border-primary)] last:border-0">
                    <div className="w-20 font-medium text-[color:var(--text-primary)]">{day.day}</div>
                    <div className="text-2xl">{getWeatherIcon(day.icon)}</div>
                    <div className="text-[color:var(--text-secondary)] capitalize">{day.condition}</div>
                    <div className="flex space-x-4 w-32 justify-end">
                      <span className="font-bold text-[color:var(--text-primary)]">H:{day.high}°</span>
                      <span className="text-[color:var(--text-secondary)]">L:{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 text-center border border-[color:var(--border-primary)]">
            <p className="text-[color:var(--text-secondary)]">No weather data available</p>
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-[color:var(--text-secondary)]">
          <p>Data refreshes every 15 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherScreen;