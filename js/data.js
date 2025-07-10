// XRP Validator nodes med geografiske positioner
export const xrpValidatorNodes = [
    { 
        name: "Ripple Lab (San Francisco)", 
        lat: 37.7749, 
        lon: -122.4194, 
        pubkey: "nHUPKoGr78vEFANjXfLpGYuBqPwXXq1dHgTaJrfGtQnZcFjFdJPR",
        country: "USA",
        city: "San Francisco"
    },
    { 
        name: "Ripple Lab (Dublin)", 
        lat: 53.3498, 
        lon: -6.2603, 
        pubkey: "nHUTh2DRMx4TH8iNc3qYnFLzLXpqxoVZBJMUHNbxJEkQdLNSqpXH",
        country: "Ireland",
        city: "Dublin"
    },
    { 
        name: "Ripple Lab (Singapore)", 
        lat: 1.3521, 
        lon: 103.8198, 
        pubkey: "nHUP3pWBaEHcfzTdDBdKj9yFfSTJUdJGz6PRAskLJCHtmLTDRKvH",
        country: "Singapore",
        city: "Singapore"
    },
    { 
        name: "Coil (New York)", 
        lat: 40.7128, 
        lon: -74.0060, 
        pubkey: "nHUryiyDqEtyWVtFG24AAhaYjMf9FRLietQcQrcbdN5PjjWjCRKN",
        country: "USA",
        city: "New York"
    },
    { 
        name: "Bithomp (Netherlands)", 
        lat: 52.3676, 
        lon: 4.9041, 
        pubkey: "nHULqGBkJtWeNFjhTzYeAsHA3qKKS7HoBh8CV3BAGTGMZuepEhWC",
        country: "Netherlands",
        city: "Amsterdam"
    },
    { 
        name: "XRPL Labs (Netherlands)", 
        lat: 52.3676, 
        lon: 4.9041, 
        pubkey: "nHUn13jKRSvyRW5HGPqmMjvAJGELzSLVZpKAMBXTMKNcLnYtJSgH",
        country: "Netherlands",
        city: "Amsterdam"
    },
    { 
        name: "Alloy Networks (USA)", 
        lat: 39.0458, 
        lon: -76.6413, 
        pubkey: "nHUDHXNKHtQnPn6pKfGpEcbSvw8VhGbBPQFhKWo4kqEYhpMqZwdh",
        country: "USA",
        city: "Baltimore"
    },
    { 
        name: "Gatehub (UK)", 
        lat: 51.5074, 
        lon: -0.1278, 
        pubkey: "nHUkKNxGWFqM41U5YWDdBvhQmEUvNGmUqMGcFnfT4gRQdRPEpJcS",
        country: "UK",
        city: "London"
    },
    { 
        name: "Sologenic (Canada)", 
        lat: 43.6532, 
        lon: -79.3832, 
        pubkey: "nHUBqFKgCsS7P6RmxXQyNVnVk2PVVvEMkjhXCJCk8kfmZtQJhDDd",
        country: "Canada",
        city: "Toronto"
    },
    { 
        name: "Validator (Tokyo)", 
        lat: 35.6762, 
        lon: 139.6503, 
        pubkey: "nHUVFHTdJwdNUbUeUJFW5q4NQHxBYGfJsZNHdBrUnTNzQCpGHnLY",
        country: "Japan",
        city: "Tokyo"
    },
    { 
        name: "Validator (Sydney)", 
        lat: -33.8688, 
        lon: 151.2093, 
        pubkey: "nHUKVKfBmYdSVKuPRMKjmyDqBFZjKfxJbVtHDTM4TQEJ3RaKdVUH",
        country: "Australia",
        city: "Sydney"
    },
    { 
        name: "Validator (Mumbai)", 
        lat: 19.0760, 
        lon: 72.8777, 
        pubkey: "nHUJunGYCLWqZFvxGBNFfBnpwYxBGJhKGQfFnJNqRSgEQJgHsVfv",
        country: "India",
        city: "Mumbai"
    },
    { 
        name: "Validator (São Paulo)", 
        lat: -23.5505, 
        lon: -46.6333, 
        pubkey: "nHUKoGrxnHwcKpJrVSgRSZBLFq8qmJGLdDxKLKgLJGSfGhLwRrxK",
        country: "Brazil",
        city: "São Paulo"
    },
    { 
        name: "Validator (Frankfurt)", 
        lat: 50.1109, 
        lon: 8.6821, 
        pubkey: "nHUJbHBY7fGWMjJsTSjVmLGxPzhhqBbczK4ysBG1BNWPCqJgMjwS",
        country: "Germany",
        city: "Frankfurt"
    },
    { 
        name: "Validator (Seoul)", 
        lat: 37.5665, 
        lon: 126.9780, 
        pubkey: "nHUKBvTyqfVMN3LXZNNfFYcnhqBCQHdLFLcqVNNWzBMSdQGGLjGD",
        country: "South Korea",
        city: "Seoul"
    }
];

// Simulerede geografiske positioner for XRP adresser
export const sampleAddressLocations = [
    { lat: 37.7749, lon: -122.4194 }, // San Francisco
    { lat: 40.7128, lon: -74.0060 },  // New York
    { lat: 51.5074, lon: -0.1278 },   // London
    { lat: 35.6762, lon: 139.6503 },  // Tokyo
    { lat: 1.3521, lon: 103.8198 },   // Singapore
    { lat: 52.3676, lon: 4.9041 },    // Amsterdam
    { lat: 53.3498, lon: -6.2603 },   // Dublin
    { lat: 43.6532, lon: -79.3832 },  // Toronto
    { lat: -33.8688, lon: 151.2093 }, // Sydney
    { lat: 19.0760, lon: 72.8777 },   // Mumbai
    { lat: -23.5505, lon: -46.6333 }, // São Paulo
    { lat: 50.1109, lon: 8.6821 },    // Frankfurt
    { lat: 37.5665, lon: 126.9780 },  // Seoul
    { lat: 45.4642, lon: 9.1900 },    // Milano
    { lat: 55.7558, lon: 37.6176 },   // Moskva
    { lat: 39.9042, lon: 116.4074 },  // Beijing
    { lat: 31.2304, lon: 121.4737 },  // Shanghai
    { lat: 25.2048, lon: 55.2708 },   // Dubai
    { lat: -34.6037, lon: -58.3816 }, // Buenos Aires
    { lat: 6.5244, lon: 3.3792 }      // Lagos
];

// Utility functions
export function latLongToVector3(lat, lon, radius = 5) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
}
