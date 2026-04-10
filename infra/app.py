#!/usr/bin/env python3
import aws_cdk as cdk
from stack import ExecIntelStack

app = cdk.App()
ExecIntelStack(app, "ExecIntelStack")
app.synth()
