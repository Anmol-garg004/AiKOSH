import asyncio
import edge_tts

async def main():
    voices = await edge_tts.list_voices()
    for v in voices:
        if 'pa' in v['Locale'].lower():
            print(v['Name'])

if __name__ == '__main__':
    asyncio.run(main())
