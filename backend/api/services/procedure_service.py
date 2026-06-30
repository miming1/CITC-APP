from ..models import (
    Procedures,
    ProcedureSteps,
    ProcedureRequirements,
    Faqs
)


def get_full_procedure(procedure_id):

    # =========================
    # MAIN PROCEDURE
    # =========================
    procedure = Procedures.objects.get(
        pk=procedure_id
    )

    # =========================
    # STEPS
    # =========================
    steps = ProcedureSteps.objects.filter(
        procedure_id=procedure_id
    ).order_by("step_number")

    # =========================
    # REQUIREMENTS
    # Flatten ProcedureRequirements -> Requirements
    # =========================
    requirement_links = (
        ProcedureRequirements.objects
        .filter(procedure_id=procedure_id)
        .select_related("requirement")
    )

    requirements = [
        {
            "requirement_id": link.requirement.requirement_id,
            "requirement_name": link.requirement.requirement_name,
        }
        for link in requirement_links
    ]

    # =========================
    # ANSWERED FAQS
    # =========================
    # Faqs are related through FaqCategories -> Procedures
    faqs = Faqs.objects.exclude(
        answer=""
    ).filter(
        category__procedure_id=procedure_id
    )

    # =========================
    # PENDING QUESTIONS
    # =========================
    pending_questions = Faqs.objects.filter(
        answer="",
        category__procedure_id=procedure_id
    )

    # =========================
    # RETURN
    # =========================
    return {
        "procedure": procedure,
        "steps": steps,
        "requirements": requirements,
        "faqs": faqs,
        "pending_questions": pending_questions,
    }