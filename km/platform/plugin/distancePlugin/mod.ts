export async function updateDistances(){
    const request = new Request("https://api.yext.com/v2/accounts/me/entities?v=20230206&entityTypes=location&api_key=${{apiKey}}", {
        method: 'GET',
        headers: {
        "content-type": "application/json",
        },
        });
    const myResponse = await fetch(request).then(response => response.json())
    var myDict = {};
    for (var i = 0; i< myResponse.response.entities.length; i++) {
        var obj = myResponse.response.entities[i]
        myDict[obj.meta.id.toString()] = obj.yextDisplayCoordinate
    }

    var pageToken = myResponse.response.pageToken

    while (typeof pageToken === 'string') {
        var requestUrl = "https://api.yext.com/v2/accounts/me/entities?v=20230206&entityTypes=location&api_key=${{apiKey}}&pageToken=" + pageToken
        const request = new Request(requestUrl, {
            method: 'GET',
            headers: {
            "content-type": "application/json",
            },
            });
        const myResponse = await fetch(request).then(response => response.json())
        for (var i = 0; i< myResponse.response.entities.length; i++) {
            var obj = myResponse.response.entities[i]
            myDict[obj.meta.id.toString()] = obj.yextDisplayCoordinate
        }
        pageToken = myResponse.response.pageToken
    }


    for (const entityId in myDict) {
        //console.log(entityId)
        const allDistances = []
        for (const otherEntityId in myDict) {
            const distances = []
            if (entityId !== otherEntityId) {
                distances.push(otherEntityId)
                var lat1 = myDict[entityId].latitude
                var lat2 = myDict[otherEntityId].latitude
                var lon1 = myDict[entityId].longitude
                var lon2 = myDict[otherEntityId].longitude
                var distance = getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2)
                var roundedDistance = Math.round(distance * 100) / 100
                distances.push(roundedDistance)
                allDistances.push(distances)
            }
        }
        var sortedArray = allDistances.sort(function(a, b) {return a[1] - b[1];});
        //send POST request to Entities API to push the top five closest entities and how far they are

        var measurement = "${{milesOrKilometers}}"

        if (measurement === 'Miles' || measurement === 'miles') {
            var data = {"c_closestLocations": [
                {
                  "MilesFromLocation": "TKTK",
                  "location": ["TKTK"]
                },
                {
                    "MilesFromLocation": "TKTK",
                    "location": ["TKTK"]
                },
                {
                    "MilesFromLocation": "TKTK",
                    "location": ["TKTK"]
                },
                {
                    "MilesFromLocation": "TKTK",
                    "location": ["TKTK"]
                },
                {
                    "MilesFromLocation": "TKTK",
                    "location": ["TKTK"]
                },
              ]}
    
            for (var i = 0; i< 5; i++){
                var newObject =             {
                    "location": ["TKTK"],
                    "MilesFromLocation": "TKTK"
                  }
                newObject.MilesFromLocation = sortedArray[i][1].toString()
                var mySingleLocationArray = []
                mySingleLocationArray.push(sortedArray[i][0])
                newObject.location = mySingleLocationArray
                data.c_closestLocations[i] = newObject
            }
        }

        else {
            var data = {"c_closestLocations": [
                {
                  "KilometersFromLocation": "TKTK",
                  "location": ["TKTK"]
                },
                {
                    "KilometersFromLocation": "TKTK",
                    "location": ["TKTK"]
                },
                {
                    "KilometersFromLocation": "TKTK",
                    "location": ["TKTK"]
                },
                {
                    "KilometersFromLocation": "TKTK",
                    "location": ["TKTK"]
                },
                {
                    "KilometersFromLocation": "TKTK",
                    "location": ["TKTK"]
                },
              ]}
    
            for (var i = 0; i< 5; i++){
                var newObject =             {
                    "location": ["TKTK"],
                    "KilometersFromLocation": "TKTK"
                  }
                newObject.KilometersFromLocation = sortedArray[i][1].toString()
                var mySingleLocationArray = []
                mySingleLocationArray.push(sortedArray[i][0])
                newObject.location = mySingleLocationArray
                data.c_closestLocations[i] = newObject
            }
        }


        console.log(data)

        const entityUrlEndpoint = "https://api.yext.com/v2/accounts/me/entities/" + entityId + "?v=20230206&api_key=${{apiKey}}"
        const request = new Request(entityUrlEndpoint, {
            method: 'PUT',
            headers: {
            "content-type": "application/json",
            },
            body: JSON.stringify(data)
            });
        const myResponse = await fetch(request).then(response => response.json())
    }
}

export function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var measurement = "${{milesOrKilometers}}"
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    if (measurement === 'miles' || measurement === 'Miles') {
        var dInMiles = d / 1.60934
        return dInMiles
    }
    else {
        return d;
    }
  }

export function deg2rad(deg) {
    return deg * (Math.PI/180)
  }
