const Locker = require("../models/Lockers");
const Site = require("../models/Site");
// update relay state

const updateRelayState = async (id, state,res) => {
    try {
      const locker = await Locker.findOne({ _id: id });
      if (locker) {
        return true;
        const site = await Site.findOne({ _id: locker.site });
        // const RELAY_IP = site.url;
        // const url = `${RELAY_IP}/state.xml?relay${locker.relay}State=${state}`;
        // const response = await axios.get(url, {
        //   timeout: 20000,
        // });
        // if (response.status === 200) {
        //   const xml = response.data;
        //   const relayArr = parseXmlResponse(xml);
        //  return true;
        // } else {
        //  return false;
        // }
      }
    } catch (error) {
      if (error.code === "ECONNRESET") {
        return true;
      }
      return false;
    }
  };
  module.exports = updateRelayState;