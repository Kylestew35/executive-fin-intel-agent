from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
    aws_dynamodb as ddb,
    aws_s3 as s3,
)
from constructs import Construct

class ExecIntelStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        table = ddb.Table(
            self, "AgentMemory",
            partition_key={"name": "userId", "type": ddb.AttributeType.STRING}
        )

        bucket = s3.Bucket(self, "ExecIntelLogs")

        fn = _lambda.Function(
            self, "AgentLambda",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="main.handler",
            code=_lambda.Code.from_asset("../backend"),
            environment={
                "TABLE_NAME": table.table_name,
                "BUCKET_NAME": bucket.bucket_name,
            }
        )

        api = apigw.LambdaRestApi(
            self, "ExecIntelApi",
            handler=fn,
            proxy=True
        )

        table.grant_read_write_data(fn)
        bucket.grant_write(fn)
