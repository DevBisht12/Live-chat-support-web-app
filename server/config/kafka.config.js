import {Kafka,logLevel} from 'kafkajs'

export const kafka =  new Kafka({
    brokers:['amusing-skylark-10011-eu2-kafka.upstash.io:9092'],
    ssl:true,
    sasl:{
        mechanism: 'scram-sha-256',
        username: 'YW11c2luZy1za3lsYXJrLTEwMDExJP67AKWcHZrp94bI9POAgFe9OGhAgJax53s',
        password: 'NjU4MmNhZmUtNWI2NS00OTk4LTljYjQtNjdkNjJiOTYwZDUx'
    },
    logLevel:logLevel.ERROR
})

export const producer= kafka.producer()
export const consumer= kafka.consumer({
    groupId:"chat_support"
})


export const connectKafkaProducer= async()=>{
    try {
        await producer.connect()
        console.log("Kafka producer connected...")
    } catch (error) {
        console.log("Failed to connect to kafka producer:",error)
    }
}

export const produceChatRequest = async (topic,data) => {
    try {
        const chatRequests = data.map((request) => ({
            value: JSON.stringify(request)
        }));

        await producer.send({
            topic: topic, 
            messages: chatRequests, 
        });

        console.log('Chat requests sent to Kafka successfully');
    } catch (error) {
        console.error('Error sending chat requests to Kafka:', error);
    }
};


export const consumeChatRequests= async(topic)=>{
    try {
        await consumer.connect()
        await  consumer.subscribe({topic:topic, fromBeginning:true})
        await consumer.run({
            eachMessage:async({topic,partition,message})=>{
                const parseData= JSON.parse(message.value)
                console.log({
                    partition,
                    offset:message.offset,
                    value:parseData
                })
            }
        })
    } catch (error) {
        
    }
}