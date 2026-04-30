using AutoMapper;
using BookingApp.Models;
using BookingApp.DTOs;

namespace BookingApp.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<User, UserDto>();
            CreateMap<RegisterRequest, User>();
            
            CreateMap<Booking, BookingDto>()
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User != null ? src.User.Email : string.Empty));
            
            CreateMap<CreateBookingRequest, Booking>();
        }
    }
}
