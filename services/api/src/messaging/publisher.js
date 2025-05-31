const getChannel = require("./rabbitMQ.js");

let channel;

startup();

async function startup() {
  try {
    // Get the channel from the promise
    channel = await getChannel();

    // Declare a queue for publishing messages
    await channel.assertExchange(process.env.ITEM_EXCHANGE, "direct", {
      durable: true,
    });

    console.log("Publisher started successfully");
  } catch (error) {
    console.log("Error in startup:", error);
  }
}

const publish = async function publish(exchange, routingKey, msg) {
  try {
    // Convert the message to a Buffer
    const buffer = Buffer.from(JSON.stringify(msg));

    // Publish the message to the exchange with the routing key
    channel.publish(
      exchange,
      routingKey,
      buffer,
      { persistent: true },
      (err) => {
        if (err) {
          console.log("Error in confirm:", err);
        } else {
          console.log(
            `Message confirmed. routing key: ${routingKey}, exchange: ${exchange}`
          );
        }
      }
    );

    console.log(
      `Message published successfully. routing key: ${routingKey}, exchange: ${exchange}`
    );
  } catch (error) {
    console.log("Error in publish:", error);
  }
};

module.exports = publish;
