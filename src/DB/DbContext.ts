import { randomUUID } from 'crypto';
import mysql from 'mysql2';


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "Shopper",
});

export function connectionDb() {
    connection.connect((err) => {
        console.log("Conexão realizada com sucesso.");
        if(err) console.log(err.message);
    })
    return connection;
};

export async function InsertOneCustomer(
    customer_code:string, 
    image:string, 
    measure_datetime:string, 
    measure_type:string,
    measure_value: string
) {
    var measure_uuid = randomUUID();
    // connection.query(`INSERT INTO Customer (customer_code, image, measure_datetime, measure_type, measure_uuid, measure_value) VALUES ('${customer_code}', '${image}', '${measure_datetime}', '${measure_type}', '${measure_uuid}', ${measure_value})`, (err) => {
    //     if(!err) {
            console.log(`Dados inseridos com sucesso: {
                    ${customer_code},
                    ${image},
                    ${measure_datetime},
                    ${measure_type}
                }`);
            return {
                "image_url": image,
                "measure_uuid": measure_uuid,
                "measure_value": measure_value,
                "measure_datetime": measure_datetime
            };
    //     } else {
    //         console.log(err.message);
    //     }
    // });
}

export function GetCustomerByCustomerCode(customer_code: string, measure_type?: string) {

    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM Customer WHERE Customer.customer_code = '${customer_code}';`, (err, result:Array<any>) => {
            if(err) reject(new Error(err.message));
            if(result.length == 0) reject();

            if(measure_type) {
                var listType = result.map(item => item.measure_type == measure_type ? item : "");
                if(listType[0] == "") {
                    return resolve(listType[0]);
                } else {
                    return resolve(listType);
                }
            }
            resolve(result);
        }); 
    })
}

export async function GetCustomerByMeasureUuid(measure_uuid: string) {

    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM Customer WHERE Customer.measure_uuid = '${measure_uuid}';`, (err, result:Array<any>) => {
            if(err) reject(new Error(err.message));
            if(result.length == 0) return reject();
            resolve(result[0]);
        });      
    })
}

export async function AlterCustomerValue(measure_uuid: string, confirmed_value: Int32Array) {

    return new Promise(async (resolve, reject) => {

        connection.query(`UPDATE Customer SET measure_value = ${confirmed_value} WHERE Customer.measure_uuid = '${measure_uuid}';`, (err, result:Array<any>) => {
            if(err) reject(new Error(err.message));
            if(result.length == 0) reject();

            resolve(result);
        }); 
    })
}