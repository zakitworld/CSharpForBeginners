using FluentValidation;
using BookingApp.DTOs;

namespace BookingApp.Validators
{
    public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
    {
        public CreateBookingRequestValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Date).NotEmpty();
            RuleFor(x => x.Start).NotEmpty();
            RuleFor(x => x.End).NotEmpty().GreaterThan(x => x.Start)
                .WithMessage("End time must be after start time");
            RuleFor(x => x.Description).MaximumLength(500);
        }
    }
}
