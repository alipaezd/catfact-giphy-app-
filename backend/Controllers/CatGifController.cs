using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CatGifApi.Data;
using CatGifApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CatGifApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatGifController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly CatGifDbContext _context;

        public CatGifController(HttpClient httpClient, CatGifDbContext context)
        {
            _httpClient = httpClient;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CatFactWithGif>> GetCatFactWithGif()
        {
            try
            {
                // Obtener un dato curioso de gatos
                var catFactResponse = await _httpClient.GetFromJsonAsync<CatFact>("https://catfact.ninja/fact");

                // Obtener un gif desde la API de Giphy (puedes reemplazar la API_KEY)
                string giphyApiKey = "TU_API_KEY_DE_GIPHY";
                var giphyUrl = $"https://api.giphy.com/v1/gifs/search?api_key={giphyApiKey}&q=cat&limit=1&offset=0&rating=g&lang=en&bundle=messaging_non_clips";
                var giphyResponse = await _httpClient.GetFromJsonAsync<GiphyApiResponse>(giphyUrl);

                var gifUrl = giphyResponse?.Data?[0]?.Images?.Original?.Url;

                // Guardar en la base de datos
                var gif = new Gif { Url = gifUrl };
                _context.Gifs.Add(gif);

                var fact = new CatFact { Fact = catFactResponse?.Fact };
                _context.CatFacts.Add(fact);

                await _context.SaveChangesAsync();

                // Combinar y devolver
                return Ok(new CatFactWithGif
                {
                    Fact = fact.Fact,
                    GifUrl = gif.Url
                });
            }
            catch
            {
                return StatusCode(500, "Error interno al obtener los datos.");
            }
        }
    }

    public class CatFactWithGif
    {
        public string Fact { get; set; } = string.Empty;
        public string GifUrl { get; set; } = string.Empty;
    }

    // Modelo simplificado de Giphy
    public class GiphyApiResponse
    {
        public List<GifData> Data { get; set; } = new();
    }

    public class GifData
    {
        public GifImages Images { get; set; } = new();
    }

    public class GifImages
    {
        public GifOriginal Original { get; set; } = new();
    }

    public class GifOriginal
    {
        public string Url { get; set; } = string.Empty;
    }
}
