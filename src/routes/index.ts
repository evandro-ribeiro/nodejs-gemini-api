import { Response, Router, Request } from 'express';
import { Gemini } from '../gemini';
import { AlterCustomerValue, connectionDb, GetCustomerByCustomerCode, GetCustomerByMeasureUuid } from '../DB/DbContext';

export const router = Router();

var connection = connectionDb();

router.post('/upload', async (req: Request, res: Response) => {
    try {
        /**
         * Se desejável, é possível fazer uma chamada desta forma:
         * Gemini("./agua.png");
         */

        var gemini = Gemini().then(response => {
            if(typeof response.image_url != "string"){
                res.status(400).json({
                    "error_code": "INVALID_DATA",
                    "error_description": "O atributo image_url não é uma string válida.",
                });
            }
            if(typeof response.measure_value != "number"){
                res.status(400).json({
                    "error_code": "INVALID_DATA",
                    "error_description": "O atributo measure_value não é um número válido.",
                });
            }
            if(typeof response.measure_uuid != "string"){
                res.status(400).json({
                    "error_code": "INVALID_DATA",
                    "error_description": "O atributo measure_uuid não é uma string válida.",
                });
            }

            //ARRUMAR A CONSULTA PARA UMA PROMISE

            // var existsMeasure = connection.query(`SELECT measure_uuid FROM Customer WHERE Customer.measure_uuid = '${response.measure_uuid}'`, (err, result, fields) => console.log(err));
            // if(existsMeasure){
            //     res.status(409).json({
            //         "error_code": "DOUBLE_REPORT",
            //         "error_description": "Leitura do mês já realizada.",
            //     });
            // }
            return response;
        });

        let result = await gemini; 
        res.status(200).json(result);
    } catch (err: any) {
        return res.status(400).json({
            message: err || "Unexpected error"
        });
    }
    
});

router.put('/confirm', async (req: Request, res: Response) => {
    var measure_uuid: string = req.body.measure_uuid;
    var confirmed_value: Int32Array = req.body.confirmed_value;

    if(typeof measure_uuid != "string" || typeof confirmed_value != "number"){
        res.status(400).json({
            "error_code": "INVALID_DATA",
            "error_description": "Os dados fornecidos no corpo da requisição são inválidos",
        });
    }

    try {
        await GetCustomerByMeasureUuid(measure_uuid);
        await AlterCustomerValue(measure_uuid, confirmed_value);
        res.status(200).json({"success": true});
    } catch (err) {
        return res.status(404).json({
            message: {
                "error_code": "MEASURES_NOT_FOUND",
                "error_description": "Nenhuma leitura encontrada"
            }
        })
    }
});

router.get('/:customer_code/list', async (req: Request, res: Response) => {
    var customer_code = req.params.customer_code;
    var measure_type = req.query.measure_type?.toString();

    try {
        if(measure_type) {
            var result = await GetCustomerByCustomerCode(customer_code, measure_type);
            if(result == "") {
                return res.status(400).json({
                    message: {
                        "error_code": "INVALID_TYPE",
                        "error_description": "Tipo de medição não permitida"
                    }
            })};
            return res.status(200).json(result);
        }
        var result = await GetCustomerByCustomerCode(customer_code);
        res.status(200).json({
            "customer_code": {customer_code},
            "measures": [{result, "has_confirmed": true}]
        });
    } catch (err) {
        return res.status(404).json({
            message: {
                "error_code": "MEASURES_NOT_FOUND",
                "error_description": "Nenhuma leitura encontrada"
            }
        })
    }
});

