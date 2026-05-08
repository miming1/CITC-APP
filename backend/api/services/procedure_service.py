from ..models import (
    Procedures,
    ProcedureSteps,
    ProcedureRequirements,
    Faqs
)

def get_full_procedure(procedure_id):

    procedure = Procedures.objects.get(
        pk=procedure_id
    )

    steps = ProcedureSteps.objects.filter(
        procedure_id=procedure_id
    ).order_by("step_number")

    requirements = ProcedureRequirements.objects.filter(
        procedure_id=procedure_id
    )

    # ANSWERED FAQS
    faqs = Faqs.objects.exclude(
        answer=""
    ).filter(
        procedure_id=procedure_id
    )

    # PENDING USER QUESTIONS
    pending_questions = Faqs.objects.filter(
        procedure_id=procedure_id,
        answer=""
    )

    return {
        "procedure": procedure,
        "steps": steps,
        "requirements": requirements,

        # visible to users
        "faqs": faqs,

        # for admin panel
        "pending_questions": pending_questions,
    }