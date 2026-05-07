from ..models import (
    Procedures,
    ProcedureSteps,
    ProcedureRequirements,
    Faqs
)

def get_full_procedure(procedure_id):
    procedure = Procedures.objects.get(pk=procedure_id)

    steps = ProcedureSteps.objects.filter(
        procedure_id=procedure_id
    ).order_by("step_number")

    requirements = ProcedureRequirements.objects.filter(
        procedure_id=procedure_id
    )

    faqs = Faqs.objects.filter(
        procedure_id=procedure_id
    )

    return {
        "procedure": procedure,
        "steps": steps,
        "requirements": requirements,
        "faqs": faqs,
    }