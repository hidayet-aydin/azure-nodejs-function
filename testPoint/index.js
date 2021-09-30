const { GraphQLClient, gql } = require("graphql-request");

const shortQuery = (name) =>
  (query = gql`
{
  getCityByName(name: "${name}") {
    name
    country
    weather {
      summary {
        title
        description
      }
      temperature {
        actual
        feelsLike
        min
        max
      }
      timestamp
    }
  }
}
`);

const longQuery = (name) =>
  (query = gql`
  {
    getCityByName(name: "${name}") {
      id
      name
      country
      coord {
        lon
        lat
      }
      weather {
        summary {
          title
          description
          icon
        }
        temperature {
          actual
          feelsLike
          min
          max
        }
        wind {
          speed
          deg
        }
        clouds {
          all
          visibility
          humidity
        }
        timestamp
      }
    }
  }
`);

const testPoint = async (context, req) => {
  context.log("JavaScript HTTP trigger function processed a request.");

  if (req.method !== "POST") {
    return (context.res = {
      status: 403,
      body: "Forbidden request (only allow POST request)",
    });
  }

  const detail = req.query.detail || (req.body && req.body.detail);
  const cityName = req.query.cityName || (req.body && req.body.cityName);
  if (!cityName) {
    return (context.res = {
      status: 405,
      body: "Forgotten city name! {cityName:'istanbul'}",
    });
  }

  try {
    const graphQLClient = new GraphQLClient(
      "https://graphql-weather-api.herokuapp.com/"
    );

    const query = detail ? longQuery(cityName) : shortQuery(cityName);
    const data = await graphQLClient.request(query);
    if (!data.getCityByName) {
      return (context.res = {
        status: 404,
        body: "Not found city name!",
      });
    }
    return (context.res = {
      status: 200,
      body: JSON.stringify(data, null, 2),
    });
  } catch (error) {
    return (context.res = {
      status: 500,
      body: error,
    });
  }
};

module.exports = testPoint;
