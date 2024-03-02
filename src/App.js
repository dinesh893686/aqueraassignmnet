import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [planets, setPlanets] = useState([]);
  const [nextPage, setNextPage] = useState('');
  const [loading, setLoading] = useState(true);
  const residentRef = useRef()

  useEffect(() => {
    fetchPlanets('https://swapi.dev/api/planets/');
  }, []);

  const fetchPlanets = (url) => {
    fetch(url)
      .then(response => response.json())
      .then(async (data) => {
        // console.log(data.results)
        const modifiedArray = data.results.map(async (planet) => {
          console.log(planet)
          const residents = await fetchAllResidents(planet.residents)
          console.log(residents, "line")
          return { ...planet, residents }
        })
        // fetchAllResidents(data)
        Promise.all(modifiedArray).then((resolvedValues) => {
          setPlanets(prevPlanets => [...prevPlanets, ...resolvedValues]);
          setNextPage(data.next);
          setLoading(false);
        })
          .catch((e) => {
            console.log(e)
            setPlanets([]);
          })

      })
      .catch(error => console.error('Error fetching planets:', error));
  };

  // const fetchResidentDetails = (residentUrl) => {
  //   return axios.get(residentUrl);
  // };

  const loadMorePlanets = () => {
    setLoading(true);
    fetchPlanets(nextPage);
  };

  const fetchResidentDetails = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for ${url}: ${error.message}`);
      throw error;
    }
  };

  const fetchAllResidents = async (residentUrls) => {
    console.log(residentUrls)
    const residentDetailsPromises = residentUrls.map(url => fetchResidentDetails(url));

    try {
      const residentDetails = await Promise.all(residentDetailsPromises);
      residentRef.current = residentDetails

      return residentDetails
    } catch (error) {
      console.error('Error fetching resident details:', error.message);
      residentRef.current = []
      return []
    }
  };



  return (


    <div className="App">
      <h1>Star Wars Planets Directory</h1>
      <div className="planets-container">
        {planets.map((planet, index) => (
          <div key={index} className="planet-card">
            <h2>{planet.name}</h2>
            <p>Climate: {planet.climate}</p>
            <p>Population: {planet.population}</p>
            <p>Terrain: {planet.terrain}</p>
            <h3>Residents:</h3>
            <ul>
              {
                planet.residents.map((pla,index) => {
                  return <li key={index}>
                    <h4>Resident {index + 1}:</h4>
                    <p>Name: {pla.name}</p>
                    <p>Height: {pla.height}</p>
                    <p>Mass: {pla.mass}</p>
                    <p>Skin Color: {pla.skin_color}</p>
                  </li>
                })
              }
            </ul>
          </div>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      {nextPage && !loading && <button onClick={loadMorePlanets}>Load More</button>}
    </div>
  );
}

export default App;
